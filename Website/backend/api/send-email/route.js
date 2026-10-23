import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, subject, message } = await request.json();

    if (!email || !message) {
      return Response.json(
        { success: false, error: "Email and message are required" },
        { status: 400 }
      );
    }

    const result = await resend.emails.send({
      from: "Your Website <cludflare.org>",
      to: [email],
      subject: subject || "Message from your website",
      html: `<p>${message}</p>`,
    });

    return Response.json({ success: true, result });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Email could not be sent" },
      { status: 500 }
    );
  }
}