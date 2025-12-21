'use strict';

export default {
  register() {},

  async bootstrap({ strapi }) {
    // --- UIDs ---
    const CATEGORY_UID = 'api::category.category';
    const COLOR_UID = 'api::color.color';
    const SIZE_UID = 'api::size.size';
    const PRODUCT_UID = 'api::product.product';
    const VARIANT_UID = 'api::product-variant.product-variant';
    const SETTINGS_UID = 'api::setting.setting';

    // --- Data Definitions (Arabic Only) ---

    // 1. COLORS
    const AR_COLORS = [
      { label: 'أحمر', hex: '#FF0000' },
      { label: 'أزرق', hex: '#0000FF' },
      { label: 'أسود', hex: '#000000' },
      { label: 'أبيض', hex: '#FFFFFF' },
      { label: 'أخضر', hex: '#00FF00' },
      { label: 'رمادي', hex: '#808080' },
    ];

    // 2. SIZES
    const AR_SIZES = [
      { label: 'صغير جداً' },
      { label: 'صغير' },
      { label: 'متوسط' },
      { label: 'كبير' },
      { label: 'كبير جداً' },
    ];

    // 3. CATEGORIES
    const AR_CATEGORIES = [
      { name: 'ملابس', slug: 'malabis', icon: 'shirt' },
      { name: 'إلكترونيات', slug: 'electroniyat', icon: 'zap' },
      { name: 'أحذية', slug: 'ahthiya', icon: 'shoe' },
    ];

    // 4. PRODUCTS (Must reference a Category)
    const AR_PRODUCTS = [
      {
        name: 'تي شيرت قطني',
        slug: 't-shirt-qutni',
        description: 'تي شيرت قطني مريح عالي الجودة.',
        isFeatured: true,
        categorySlug: 'malabis',
        basePrice: 99.99,
      },
      {
        name: 'قميص رسمي',
        slug: 'qamis-rasmi',
        description: 'قميص رسمي أنيق مناسب للعمل والمناسبات.',
        isFeatured: true,
        categorySlug: 'malabis',
        basePrice: 149.99,
      },
      {
        name: 'بنطلون جينز',
        slug: 'bantalon-jeans',
        description: 'بنطلون جينز عصري بتصميم حديث ومريح.',
        isFeatured: false,
        categorySlug: 'malabis',
        basePrice: 199.99,
      },
      {
        name: 'سماعات لاسلكية',
        slug: 'samaaat-lasilkiya',
        description: 'سماعات بلوتوث عالية الجودة مع خاصية إلغاء الضوضاء.',
        isFeatured: true,
        categorySlug: 'electroniyat',
        basePrice: 299.99,
      },
      {
        name: 'حذاء رياضي',
        slug: 'hithaa-riyadhi',
        description: 'حذاء رياضي مريح للجري والتمارين اليومية.',
        isFeatured: true,
        categorySlug: 'ahthiya',
        basePrice: 249.99,
      },
    ];

    // 5. SETTINGS
    const AR_SETTINGS = {
      currency: 'SAR',
      shippingCost: 20.0,
      taxPercent: 15,
      siteName: 'المتجر الإلكتروني',
    };

    // --- Generic Seeding Function ---
    const createEntries = async (uid, dataArray, locale = 'ar') => {
      let createdEntries = [];

      console.log(`\n--- Checking ${uid.split('::')[1]} (${locale}) ---`);

      // Try to fetch all existing entries first
      const existingEntries = await strapi.entityService.findMany(uid, {
        filters: { locale: locale },
      });

      if (existingEntries && existingEntries.length > 0) {
        console.log(
          `✓ Found ${existingEntries.length} existing ${uid.split('::')[1]} entries. Using existing data.`,
        );
        return existingEntries;
      }

      // If no entries exist, create them
      console.log(
        `Creating ${dataArray.length} new ${uid.split('::')[1]} entries...`,
      );

      for (const data of dataArray) {
        try {
          const entry = await strapi.entityService.create(uid, {
            data: {
              ...data,
              locale: locale,
              // Set publishedAt only for types that use Draft & Publish
              publishedAt: ['category', 'product', 'setting'].some((type) =>
                uid.includes(type),
              )
                ? new Date()
                : undefined,
            },
          });
          createdEntries.push(entry);
          console.log(
            `  ✓ Created: ${data.name || data.label || data.slug || 'entry'}`,
          );
        } catch (error) {
          // If entry already exists (unique constraint), try to find it
          if (error.message.includes('unique')) {
            console.log(
              `  ⚠ Entry already exists, fetching: ${data.name || data.label || data.slug}`,
            );
            const existing = await strapi.entityService.findMany(uid, {
              filters: {
                locale: locale,
                ...(data.slug ? { slug: data.slug } : {}),
                ...(data.label ? { label: data.label } : {}),
              },
            });
            if (existing && existing.length > 0) {
              createdEntries.push(existing[0]);
            }
          } else {
            console.error(`  ✗ Error creating entry:`, error.message);
            throw error;
          }
        }
      }

      console.log(
        `✅ Successfully processed ${createdEntries.length} entries for ${uid.split('::')[1]}.`,
      );

      return createdEntries;
    };

    // Helper to create Product Variant entries
    const createVariants = async (product, colors, sizes, basePrice) => {
      console.log(
        `\n--- Checking Variants for Product "${product.name}" (ID: ${product.id}) ---`,
      );

      const existingVariants = await strapi.entityService.findMany(
        VARIANT_UID,
        {
          filters: { product: product.id },
        },
      );

      if (existingVariants && existingVariants.length > 0) {
        console.log(
          `✓ Found ${existingVariants.length} existing variants. Skipping variant creation.`,
        );
        return;
      }

      console.log(`Creating variants...`);
      let variantCount = 0;

      for (const color of colors) {
        for (const size of sizes) {
          // Add slight price variation based on size
          let priceMultiplier = 1.0;
          if (size.label === 'صغير جداً' || size.label === 'صغير') {
            priceMultiplier = 0.95;
          } else if (size.label === 'كبير' || size.label === 'كبير جداً') {
            priceMultiplier = 1.05;
          }

          const variantPrice = parseFloat(
            (basePrice * priceMultiplier).toFixed(2),
          );

          try {
            await strapi.entityService.create(VARIANT_UID, {
              data: {
                sku: `${product.slug}-${color.id}-${size.id}`,
                price: variantPrice,
                stock: Math.floor(Math.random() * 50) + 10,
                product: product.id,
                color: color.id,
                size: size.id,
              },
            });
            variantCount++;
          } catch (error) {
            if (error.message.includes('unique')) {
              console.log(
                `  ⚠ Variant already exists: ${product.slug}-${color.id}-${size.id}`,
              );
            } else {
              console.error(`  ✗ Error creating variant:`, error.message);
            }
          }
        }
      }
      console.log(`✅ Created ${variantCount} variants for "${product.name}".`);
    };

    try {
      console.log('\n========================================');
      console.log('🚀 STARTING BOOTSTRAP SEEDING PROCESS');
      console.log('========================================\n');

      // --- STAGE 1: Seed independent lookups (Colors & Sizes) ---
      const colors = await createEntries(COLOR_UID, AR_COLORS);
      const sizes = await createEntries(SIZE_UID, AR_SIZES);

      // --- STAGE 2: Seed Categories ---
      const categories = await createEntries(CATEGORY_UID, AR_CATEGORIES);

      // --- STAGE 3: Seed Products (Requires Category) ---
      let createdProducts = [];

      // Check if products already exist
      const existingProducts = await strapi.entityService.findMany(
        PRODUCT_UID,
        {
          filters: { locale: 'ar' },
        },
      );

      if (existingProducts && existingProducts.length > 0) {
        console.log(
          `\n✓ Found ${existingProducts.length} existing products. Using existing data.`,
        );
        // Assign basePrice for existing products
        createdProducts = existingProducts.map((p) => {
          const productData = AR_PRODUCTS.find((prod) => prod.slug === p.slug);
          return {
            ...p,
            basePrice: productData?.basePrice || 99.99,
          };
        });
      } else {
        console.log('\n--- Creating Products ---');

        for (const productData of AR_PRODUCTS) {
          const category = categories.find(
            (c) => c.slug === productData.categorySlug,
          );

          if (category) {
            const { categorySlug, basePrice, ...productFields } = productData;

            try {
              const product = await strapi.entityService.create(PRODUCT_UID, {
                data: {
                  ...productFields,
                  locale: 'ar',
                  category: category.id,
                  publishedAt: new Date(),
                },
              });

              // Store basePrice with product for variant creation
              product.basePrice = basePrice;
              createdProducts.push(product);
              console.log(`  ✓ Created product: ${product.name}`);
            } catch (error) {
              if (error.message.includes('unique')) {
                console.log(`  ⚠ Product already exists: ${productData.name}`);
                // Try to fetch the existing product
                const existing = await strapi.entityService.findMany(
                  PRODUCT_UID,
                  {
                    filters: { slug: productData.slug, locale: 'ar' },
                  },
                );
                if (existing && existing.length > 0) {
                  existing[0].basePrice = basePrice;
                  createdProducts.push(existing[0]);
                }
              } else {
                console.error(`  ✗ Error creating product:`, error.message);
              }
            }
          } else {
            console.warn(
              `  ⚠ Category "${productData.categorySlug}" not found. Skipping product "${productData.name}".`,
            );
          }
        }

        console.log(
          `\n✅ Successfully processed ${createdProducts.length} products.`,
        );
      }

      // --- STAGE 4: Seed Variants (Requires Product, Color, and Size) ---
      if (createdProducts.length > 0 && colors.length > 0 && sizes.length > 0) {
        console.log('\n========================================');
        console.log('🎨 CREATING PRODUCT VARIANTS');
        console.log('========================================');

        for (const product of createdProducts) {
          await createVariants(product, colors, sizes, product.basePrice);
        }
      } else {
        console.warn(
          '\n⚠ Cannot create variants: Missing products, colors, or sizes.',
        );
      }

      // --- STAGE 5: Seed Settings (Singleton-like) ---
      await createEntries(SETTINGS_UID, [AR_SETTINGS]);

      console.log('\n========================================');
      console.log('✅ BOOTSTRAP SEEDING COMPLETED SUCCESSFULLY');
      console.log('========================================\n');

      // Summary
      console.log('📊 SEEDING SUMMARY:');
      console.log(`   - Colors: ${colors.length}`);
      console.log(`   - Sizes: ${sizes.length}`);
      console.log(`   - Categories: ${categories.length}`);
      console.log(`   - Products: ${createdProducts.length}`);
      console.log(`   - Variants per product: ${colors.length * sizes.length}`);
      console.log(
        `   - Total variants: ${createdProducts.length * colors.length * sizes.length}\n`,
      );
    } catch (error) {
      console.error('\n❌ CRITICAL ERROR DURING SEEDING:');
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  },

  destroy() {},
};
