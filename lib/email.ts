
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, code: string) {
  const from = process.env.OTP_FROM_EMAIL;

  if (!process.env.RESEND_API_KEY || !from) {
    throw new Error("Resend environment variables are missing.");
  }

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Your IRL verification code",
    text: `Your IRL sign-in code is ${code}. It expires in 10 minutes. Never share this code with anyone.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#171717">
        <h1>IRL.</h1>
        <h2>Verify your sign-in</h2>
        <p>Enter this code on IRL to finish signing in:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px">${code}</p>
        <p>This code expires in 10 minutes. Never share it with anyone.</p>
        <p>If you did not try to sign in, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend failed:", error.name);
    throw new Error("Unable to send verification email.");
  }
}
