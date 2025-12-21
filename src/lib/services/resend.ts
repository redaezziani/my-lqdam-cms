import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

export async function sendResendEmail({ to, subject, react }: SendEmailParams) {
  const { error } = await resend.emails.send({
    from: "Store <noreply@yourdomain.com>",
    to,
    subject,
    react,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Email sending failed");
  }
}
