#!/bin/bash

# setup-models.sh
# Generates Strapi v5 e-commerce models with i18n (ar default, en secondary)

BASE_DIR=src/api
mkdir -p $BASE_DIR

# ---------------------- Category ----------------------
mkdir -p $BASE_DIR/category/content-types/category
cat > $BASE_DIR/category/content-types/category/schema.json <<EOL
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": {"singularName": "category", "pluralName": "categories", "displayName": "Category"},
  "options": {"draftAndPublish": true},
  "pluginOptions": {"i18n": {"localized": true}},
  "attributes": {
    "name": {"type": "string", "pluginOptions": {"i18n": {"localized": true}}, "required": true},
    "slug": {"type": "uid", "targetField": "name", "required": true},
    "description": {"type": "richtext", "pluginOptions": {"i18n": {"localized": true}}},
    "icon": {"type": "string"},
    "products": {"type": "relation", "relation": "oneToMany", "target": "api::product.product", "mappedBy": "category"}
  }
}
EOL

# ---------------------- Product ----------------------
mkdir -p $BASE_DIR/product/content-types/product
cat > $BASE_DIR/product/content-types/product/schema.json <<EOL
{
  "kind": "collectionType",
  "collectionName": "products",
  "info": {"singularName": "product", "pluralName": "products", "displayName": "Product"},
  "options": {"draftAndPublish": true},
  "pluginOptions": {"i18n": {"localized": true}},
  "attributes": {
    "name": {"type": "string", "pluginOptions": {"i18n": {"localized": true}}, "required": true},
    "slug": {"type": "uid", "targetField": "name", "required": true},
    "description": {"type": "richtext", "pluginOptions": {"i18n": {"localized": true}}},
    "images": {"type": "media", "multiple": true, "required": true},
    "isFeatured": {"type": "boolean", "default": false},
    "category": {"type": "relation", "relation": "manyToOne", "target": "api::category.category", "inversedBy": "products"},
    "variants": {"type": "relation", "relation": "oneToMany", "target": "api::product-variant.product-variant", "mappedBy": "product"}
  }
}
EOL

# ---------------------- ProductVariant ----------------------
mkdir -p $BASE_DIR/product-variant/content-types/product-variant
cat > $BASE_DIR/product-variant/content-types/product-variant/schema.json <<EOL
{
  "kind": "collectionType",
  "collectionName": "product_variants",
  "info": {"singularName": "product-variant", "pluralName": "product-variants", "displayName": "ProductVariant"},
  "options": {"draftAndPublish": false},
  "attributes": {
    "sku": {"type": "string"},
    "price": {"type": "decimal", "required": true},
    "stock": {"type": "integer", "default": 0},
    "product": {"type": "relation", "relation": "manyToOne", "target": "api::product.product", "inversedBy": "variants"},
    "color": {"type": "relation", "relation": "manyToOne", "target": "api::color.color", "inversedBy": "variants"},
    "size": {"type": "relation", "relation": "manyToOne", "target": "api::size.size", "inversedBy": "variants"}
  }
}
EOL

# ---------------------- Size ----------------------
mkdir -p $BASE_DIR/size/content-types/size
cat > $BASE_DIR/size/content-types/size/schema.json <<EOL
{
  "kind": "collectionType",
  "collectionName": "sizes",
  "info": {"singularName": "size", "pluralName": "sizes", "displayName": "Size"},
  "options": {"draftAndPublish": false},
  "pluginOptions": {"i18n": {"localized": true}},
  "attributes": {
    "label": {"type": "string", "pluginOptions": {"i18n": {"localized": true}}, "required": true},
    "variants": {"type": "relation", "relation": "oneToMany", "target": "api::product-variant.product-variant", "mappedBy": "size"}
  }
}
EOL

# ---------------------- Color ----------------------
mkdir -p $BASE_DIR/color/content-types/color
cat > $BASE_DIR/color/content-types/color/schema.json <<EOL
{
  "kind": "collectionType",
  "collectionName": "colors",
  "info": {"singularName": "color", "pluralName": "colors", "displayName": "Color"},
  "options": {"draftAndPublish": false},
  "pluginOptions": {"i18n": {"localized": true}},
  "attributes": {
    "label": {"type": "string", "pluginOptions": {"i18n": {"localized": true}}, "required": true},
    "hex": {"type": "string"},
    "variants": {"type": "relation", "relation": "oneToMany", "target": "api::product-variant.product-variant", "mappedBy": "color"}
  }
}
EOL

# ---------------------- Order ----------------------
mkdir -p $BASE_DIR/order/content-types/order
cat > $BASE_DIR/order/content-types/order/schema.json <<EOL
{
  "kind": "collectionType",
  "collectionName": "orders",
  "info": {"singularName": "order", "pluralName": "orders", "displayName": "Order"},
  "options": {"draftAndPublish": false},
  "attributes": {
    "userEmail": {"type": "string", "required": true},
    "orderItems": {"type": "relation", "relation": "oneToMany", "target": "api::order-item.order-item", "mappedBy": "order"},
    "total": {"type": "decimal", "required": true},
    "paymentStatus": {"type": "enumeration", "enum": ["pending","paid","failed","refunded"], "default": "pending"},
    "paymentMethod": {"type": "enumeration", "enum": ["card","cash-on-delivery","paypal","stripe"], "default": "stripe"},
    "trackingCode": {"type": "string"},
    "shippingAddress": {"type": "json"},
    "billingAddress": {"type": "json"}
  }
}
EOL

# ---------------------- OrderItem ----------------------
mkdir -p $BASE_DIR/order-item/content-types/order-item
cat > $BASE_DIR/order-item/content-types/order-item/schema.json <<EOL
{
  "kind": "collectionType",
  "collectionName": "order_items",
  "info": {"singularName": "order-item", "pluralName": "order-items", "displayName": "OrderItem"},
  "options": {"draftAndPublish": false},
  "attributes": {
    "productName": {"type": "string", "required": true},
    "variant": {"type": "relation", "relation": "manyToOne", "target": "api::product-variant.product-variant"},
    "quantity": {"type": "integer", "required": true},
    "price": {"type": "decimal", "required": true},
    "total": {"type": "decimal", "required": true},
    "order": {"type": "relation", "relation": "manyToOne", "target": "api::order.order", "inversedBy": "orderItems"}
  }
}
EOL

# ---------------------- Settings ----------------------
mkdir -p $BASE_DIR/settings/content-types/settings
cat > $BASE_DIR/settings/content-types/settings/schema.json <<EOL
{
  "kind": "collectionType",
  "collectionName": "settings",
  "info": {"singularName": "setting", "pluralName": "settings", "displayName": "Settings"},
  "options": {"draftAndPublish": true},
  "pluginOptions": {"i18n": {"localized": true}},
  "attributes": {
    "currency": {"type": "string", "default": "USD"},
    "shippingCost": {"type": "decimal", "default": 0},
    "taxPercent": {"type": "decimal", "default": 0},
    "siteName": {"type": "string"}
  }
}
EOL


echo "All models have been generated. Please run 'npm run build' and restart Strapi."
