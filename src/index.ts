import sgMail from "@sendgrid/mail";
import { buildCorsHeaders } from "./utils/config";
import { sendEmails } from "./services";
import type { EmailRequest } from "./types/email-request";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const { url, method } = req;
    const path = new URL(url).pathname;
    const incomingOrigin: string = req.headers.get("Origin") || "";

    // Check if the request is for the send-email route
    if (path === "/v1/send-email") {
      // Verify if the incoming origin is allowed
      // CORS check
      const headers = buildCorsHeaders(incomingOrigin);
      if (incomingOrigin && !headers.has("Access-Control-Allow-Origin")) {
        return new Response(JSON.stringify({ error: "CORS Not Allowed" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle preflight OPTIONS request
      if (method === "OPTIONS") {
        const headers = buildCorsHeaders(incomingOrigin);
        return new Response(null, { status: 204, headers });
      }

      // Process POST request
      if (method === "POST") {
        try {
          const data: EmailRequest = await req.json();
          await sendEmails(data);
          headers.set("Content-Type", "text/plain");
          return new Response("Emails sent successfully!", { headers });
        } catch (err: any) {
          return new Response(
            JSON.stringify({
              error: err.message || "Failed to send emails",
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      }
      // If the method is not OPTIONS or POST, return an error.
      return new Response("Method not allowed", { status: 405 });
    }

    // Other routes
    if (path === "/v1/" && method === "GET") {
      return new Response("Hello, World!", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new Response("ALERT: Not found!", { status: 404 });
  },
});

console.log(`Server is running on ${server.port}`);
