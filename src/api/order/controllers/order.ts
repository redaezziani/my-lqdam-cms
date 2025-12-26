import { factories } from '@strapi/strapi';
import Stripe from 'stripe';

export default factories.createCoreController(
  'api::order.order',
  ({ strapi }) => ({
    async createWithPayment(ctx) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-11-17.clover',
      });

      const { userEmail, shippingAddress, billingAddress, items } =
        ctx.request.body;

      if (!items || items.length === 0) {
        return ctx.badRequest('No items provided');
      }

      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Generate order number: ORD-YYYY-MMDD-TIMESTAMP
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const timestamp = Date.now();
      const orderNumber = `ORD-${year}-${month}${day}-${timestamp}`;

      const order: any = await strapi.entityService.create('api::order.order', {
        data: {
          orderNumber,
          userEmail,
          shippingAddress,
          billingAddress,
          paymentMethod: 'stripe',
          paymentStatus: 'pending',
          total,
        } as any,
      });

      // Generate base timestamp for this order
      const baseTimestamp = Date.now();

      await Promise.all(
        items.map(async (item, index) => {
          // Fetch variant details if variantId is provided
          let color = '';
          let size = '';

          if (item.variantId) {
            const variant: any = await strapi.entityService.findOne(
              'api::product-variant.product-variant',
              item.variantId,
              {
                populate: ['color', 'size'],
              }
            );

            if (variant) {
              color = variant.color?.label || '';
              size = variant.size?.label || '';
            }
          }

          // Generate SKU: PRODUCTNAME-COLOR-SIZE-TIMESTAMP-INDEX
          // Adding index ensures uniqueness even within same millisecond
          const timestamp = baseTimestamp + index;
          const productNameSlug = item.productName
            .toUpperCase()
            .replace(/\s+/g, '-')
            .replace(/[^A-Z0-9-]/g, '');
          const colorSlug = color ? color.toUpperCase().replace(/\s+/g, '-') : 'NOCOLOR';
          const sizeSlug = size ? size.toUpperCase().replace(/\s+/g, '-') : 'NOSIZE';
          const sku = `${productNameSlug}-${colorSlug}-${sizeSlug}-${timestamp}`;

          return strapi.entityService.create('api::order-item.order-item', {
            data: {
              orderNumber: orderNumber,
              productName: item.productName,
              sku: sku,
              color: color || null,
              size: size || null,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              variant: item.variantId || null,
              order: order.id,
            },
          });
        }),
      );

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: userEmail,
        metadata: {
          orderId: order.id.toString(),
        },
        line_items: items.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.productName,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        success_url: `http://localhost:3000/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `http://localhost:3000/checkout?status=cancel`,
      });

      return ctx.send({
        orderId: order.id,
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    },
  }),
);
