
import "dotenv/config";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error("RESEND_API_KEY is missing from .env");
  process.exit(1);
}

const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from: "IRL <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "IRL Resend test",
  text: "Your IRL email delivery test succeeded.",
});

if (error) {
  console.error("Resend error:", error);
  process.exit(1);
}

console.log("Email API accepted the request.");
console.log("Email ID:", data?.id);
