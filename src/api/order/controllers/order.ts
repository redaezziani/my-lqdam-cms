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

      const order = await strapi.entityService.create('api::order.order', {
        data: {
          userEmail,
          shippingAddress,
          billingAddress,
          paymentMethod: 'stripe',
          paymentStatus: 'pending',
          total,
        },
      });

      await Promise.all(
        items.map((item) =>
          strapi.entityService.create('api::order-item.order-item', {
            data: {
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              variant: item.variantId || null,
              order: order.id,
            },
          }),
        ),
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
