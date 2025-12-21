import { factories } from '@strapi/strapi';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export default factories.createCoreService('api::contact.contact', () => ({
  async sendEmail({ name, email, message }) {
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: 'delivered@resend.dev', // !Todo change to customerEmail
      subject: 'New Contact Message',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });
  },
}));
