import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::contact.contact',
  ({ strapi }) => ({
    async send(ctx) {
      const { name, email, message } = ctx.request.body;

      if (!name || !email || !message) {
        return ctx.badRequest('Missing required fields');
      }

      try {
        await strapi.service('api::contact.contact').sendEmail({
          name,
          email,
          message,
        });

        return ctx.send({ success: true });
      } catch (error) {
        return ctx.badRequest('Email sending failed');
      }
    },
  }),
);
