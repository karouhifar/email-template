import sgMail from "@sendgrid/mail";
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Ensure allowed origins match the actual Origin header (no trailing slash)
const allowedOrigins = [
  process.env.CORS_ORIGIN, // e.g., "https://hirteekashrivastav.com"
  process.env.CORS_ORIGIN2,
  "http://localhost:8000",
];

Bun.serve({
  port: PORT,
  async fetch(req) {
    const { url, method } = req;
    const path = new URL(url).pathname;
    const incomingOrigin = req.headers.get("Origin") || "";

    // Check if the request is for the send-email route
    if (path === "/v1/send-email") {
      // Verify if the incoming origin is allowed
      if (incomingOrigin && !allowedOrigins.includes(incomingOrigin)) {
        return new Response(JSON.stringify({ error: "CORS: Not allowed" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle preflight OPTIONS request
      if (method === "OPTIONS") {
        const headers = new Headers({
          "Access-Control-Allow-Origin": incomingOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        });
        return new Response(null, { status: 204, headers });
      }

      // Process POST request
      if (method === "POST") {
        try {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
          const data = await req.json();

          // Prepare email message for the sender
          const msg = {
            to: data.recipient,
            from: "Ritz Shrivastav <hritika12245@gmail.com>",
            subject: "Message Received – Thank You!",
            templateId: "d-7122b4b005f648798de3822bed90214a",
            dynamic_template_data: {
              name: data?.name ?? data.recipient.split("@")[0],
            },
          };

          // Prepare email message for notification
          const msg2 = {
            to: "hritika12245@gmail.com",
            from: "Ritz Shrivastav <hritika12245@gmail.com>",
            subject:
              "Message from " +
              (data?.name
                ? data?.name + "<" + data.recipient + ">"
                : data.recipient),
            text: data.message,
            html: `<strong>${data.message} - LinkedIn : ${
              data?.LinkedIn ?? "Not Provided"
            }</strong>`,
          };

          const res = await sgMail.send(msg);
          const received = await sgMail.send(msg2);
          if (!res || !received) throw new Error("Invalid response");

          const headers = new Headers({
            "Access-Control-Allow-Origin": incomingOrigin,
            "Content-Type": "text/plain",
          });
          return new Response("Email sent!", { headers });
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: "Invalid response: " + error?.message }),
            { status: 400 }
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
