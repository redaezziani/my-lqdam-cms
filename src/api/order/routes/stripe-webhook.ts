export default {
  routes: [
    {
      method: 'POST',
      path: '/stripe/webhook',
      handler: 'stripe-webhook.handleWebhook',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};
