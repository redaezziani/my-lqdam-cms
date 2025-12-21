import Stripe from 'stripe';
import { resend } from '../../../lib/services/resend';

// Email template generator for L9DAM brand
const generateCustomerEmail = (order: any, orderItems: any[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 4px;">L9DAM</h1>
              <p style="margin: 8px 0 0; color: #a1a1aa; font-size: 12px; letter-spacing: 2px;">PREMIUM STREETWEAR</p>
            </td>
          </tr>
          
          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; line-height: 80px;">✓</span>
              </div>
              <h2 style="margin: 24px 0 8px; font-size: 28px; color: #18181b;">Order Confirmed!</h2>
              <p style="margin: 0; color: #71717a; font-size: 16px;">Thank you for shopping with L9DAM</p>
            </td>
          </tr>
          
          <!-- Order Info -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" style="background-color: #fafafa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e4e4e7;">
                    <span style="color: #71717a; font-size: 14px;">Order Number</span><br>
                    <span style="color: #18181b; font-size: 18px; font-weight: 600;">#${order.id}</span>
                  </td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e4e4e7; text-align: right;">
                    <span style="color: #71717a; font-size: 14px;">Order Date</span><br>
                    <span style="color: #18181b; font-size: 18px; font-weight: 600;">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Order Items -->
          <tr>
            <td style="padding: 0 40px;">
              <h3 style="margin: 0 0 16px; font-size: 18px; color: #18181b; font-weight: 600;">Order Details</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
                <tr style="background-color: #fafafa;">
                  <td style="padding: 14px 16px; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">Item</td>
                  <td style="padding: 14px 16px; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; text-align: center;">Qty</td>
                  <td style="padding: 14px 16px; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; text-align: right;">Price</td>
                </tr>
                ${orderItems
                  .map(
                    (item) => `
                <tr>
                  <td style="padding: 16px; border-top: 1px solid #e4e4e7;">
                    <span style="font-weight: 600; color: #18181b;">${item.productName}</span>
                    ${item.variant?.color?.name || item.variant?.size?.name ? `<br><span style="font-size: 13px; color: #71717a;">${[item.variant?.color?.name, item.variant?.size?.name].filter(Boolean).join(' / ')}</span>` : ''}
                  </td>
                  <td style="padding: 16px; border-top: 1px solid #e4e4e7; text-align: center; color: #52525b;">${item.quantity}</td>
                  <td style="padding: 16px; border-top: 1px solid #e4e4e7; text-align: right; font-weight: 600; color: #18181b;">${Number(item.total).toFixed(2)} MAD</td>
                </tr>
                `,
                  )
                  .join('')}
                <tr style="background-color: #18181b;">
                  <td colspan="2" style="padding: 18px 16px; color: #ffffff; font-weight: 600; font-size: 16px;">Total</td>
                  <td style="padding: 18px 16px; text-align: right; color: #ffffff; font-weight: 700; font-size: 20px;">${Number(order.total).toFixed(2)} MAD</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Shipping Address -->
          ${
            order.shippingAddress
              ? `
          <tr>
            <td style="padding: 32px 40px 0;">
              <h3 style="margin: 0 0 12px; font-size: 18px; color: #18181b; font-weight: 600;">Shipping Address</h3>
              <p style="margin: 0; padding: 16px; background-color: #fafafa; border-radius: 8px; color: #52525b; line-height: 1.6;">
                ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}
              </p>
            </td>
          </tr>
          `
              : ''
          }
          
          <!-- Footer -->
          <tr>
            <td style="padding: 40px; text-align: center; border-top: 1px solid #e4e4e7; margin-top: 32px;">
              <p style="margin: 0 0 16px; color: #71717a; font-size: 14px;">Questions about your order?</p>
              <a href="mailto:support@l9dam.com" style="display: inline-block; padding: 12px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Contact Support</a>
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
                <p style="margin: 0; color: #a1a1aa; font-size: 12px;">© ${new Date().getFullYear()} L9DAM. All rights reserved.</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const generateAdminEmail = (order: any, orderItems: any[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 32px 40px;">
              <table width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">L9DAM</h1>
                    <p style="margin: 4px 0 0; color: #c4b5fd; font-size: 11px; letter-spacing: 1px;">ADMIN NOTIFICATION</p>
                  </td>
                  <td style="text-align: right;">
                    <span style="display: inline-block; padding: 8px 16px; background-color: rgba(255,255,255,0.2); border-radius: 20px; color: #ffffff; font-size: 14px; font-weight: 600;">🔔 New Order</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Alert Banner -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <table width="100%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <span style="font-size: 20px;">💰</span>
                    <span style="color: #92400e; font-weight: 600; margin-left: 8px;">New order received - ${Number(order.total).toFixed(2)} MAD</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Order Summary -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right: 12px;">
                    <div style="background-color: #fafafa; border-radius: 12px; padding: 20px;">
                      <p style="margin: 0 0 4px; color: #71717a; font-size: 12px; text-transform: uppercase;">Order ID</p>
                      <p style="margin: 0; color: #18181b; font-size: 24px; font-weight: 700;">#${order.id}</p>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 12px;">
                    <div style="background-color: #fafafa; border-radius: 12px; padding: 20px;">
                      <p style="margin: 0 0 4px; color: #71717a; font-size: 12px; text-transform: uppercase;">Payment Status</p>
                      <p style="margin: 0;"><span style="display: inline-block; padding: 6px 12px; background-color: #dcfce7; color: #166534; border-radius: 20px; font-size: 14px; font-weight: 600;">✓ Paid</span></p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Customer Info -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; color: #18181b; font-weight: 600;">👤 Customer Information</h3>
              <table width="100%" style="background-color: #fafafa; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px;"><strong style="color: #71717a;">Email:</strong> <span style="color: #18181b;">${order.userEmail}</span></p>
                    ${
                      order.shippingAddress
                        ? `
                    <p style="margin: 0;"><strong style="color: #71717a;">Address:</strong> <span style="color: #18181b;">${order.shippingAddress.address}, ${order.shippingAddress.city} ${order.shippingAddress.postalCode}</span></p>
                    `
                        : ''
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Order Items -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; color: #18181b; font-weight: 600;">📦 Order Items (${orderItems.length})</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
                ${orderItems
                  .map(
                    (item, i) => `
                <tr${i > 0 ? ' style="border-top: 1px solid #e4e4e7;"' : ''}>
                  <td style="padding: 16px;">
                    <span style="font-weight: 600; color: #18181b;">${item.productName}</span>
                    ${item.variant?.color?.name || item.variant?.size?.name ? `<br><span style="font-size: 13px; color: #71717a;">${[item.variant?.color?.name, item.variant?.size?.name].filter(Boolean).join(' / ')}</span>` : ''}
                  </td>
                  <td style="padding: 16px; text-align: center; color: #52525b;">×${item.quantity}</td>
                  <td style="padding: 16px; text-align: right; font-weight: 600; color: #18181b;">${Number(item.total).toFixed(2)} MAD</td>
                </tr>
                `,
                  )
                  .join('')}
                <tr style="background-color: #7c3aed;">
                  <td colspan="2" style="padding: 16px; color: #ffffff; font-weight: 600;">Total Revenue</td>
                  <td style="padding: 16px; text-align: right; color: #ffffff; font-weight: 700; font-size: 18px;">${Number(order.total).toFixed(2)} MAD</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 13px;">This is an automated notification from L9DAM Admin System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default {
  async handleWebhook(ctx) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-11-17.clover',
      });

      const sig = ctx.request.headers['stripe-signature'];
      const rawBody = ctx.request.body?.[Symbol.for('unparsedBody')];

      if (!rawBody) {
        if (process.env.NODE_ENV === 'development') {
          const event = ctx.request.body as Stripe.Event;
          return ctx.send({ received: true, mode: 'dev' });
        }
        return ctx.badRequest('No raw body found');
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          sig!,
          process.env.STRIPE_WEBHOOK_SECRET!,
        );
      } catch (err: any) {
        return ctx.badRequest(`Webhook Error: ${err.message}`);
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.orderId;

          if (orderId) {
            // Update order status
            await strapi.entityService.update(
              'api::order.order',
              parseInt(orderId),
              {
                data: {
                  paymentStatus: 'paid',
                  trackingCode: session.payment_intent as string,
                },
              },
            );

            // Fetch order with items and variant details
            const order = (await strapi.entityService.findOne(
              'api::order.order',
              parseInt(orderId),
              {
                populate: {
                  orderItems: {
                    populate: {
                      variant: {
                        populate: ['color', 'size'],
                      },
                    },
                  },
                },
              },
            )) as any;

            const orderItems = order?.orderItems || [];
            const customerEmail = session.customer_email || order?.userEmail;

            if (customerEmail) {
              await resend.emails.send({
                from: 'Acme <onboarding@resend.dev>',
                to: 'delivered@resend.dev', // !Todo change to customerEmail
                subject: `Order Confirmed! 🎉 #${orderId}`,
                html: generateCustomerEmail(order, orderItems),
              });

              // Send admin notification email
              await resend.emails.send({
                from: 'Acme <onboarding@resend.dev>',
                to: 'delivered@resend.dev', // !Todo change to admin email
                subject: `💰 New Order #${orderId} - ${Number(order.total).toFixed(2)} MAD`,
                html: generateAdminEmail(order, orderItems),
              });
            }
          }
          break;
        }
      }

      return ctx.send({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      ctx.status = 500;
      return ctx.send({ error: error.message });
    }
  },
};
