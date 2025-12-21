export default (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.request.url.startsWith('/api/stripe/webhook')) {
      // Store raw body for Stripe verification
      const chunks: Buffer[] = [];
      for await (const chunk of ctx.req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString('utf8');
      ctx.request.body = JSON.parse(rawBody);
      ctx.request.body[Symbol.for('unparsedBody')] = rawBody;
    }
    await next();
  };
};