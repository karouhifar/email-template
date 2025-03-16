import sgMail from "@sendgrid/mail";
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const allowedOrigins = [
  process.env.CORS_ORIGIN as string,
  process.env.CORS_ORIGIN2 as string,
  "http://localhost:8000/",
];

Bun.serve({
  port: PORT,
  async fetch(req) {
    const { url, method } = req;
    const path = new URL(url).pathname;

    if (path === "/v1/" && method === "GET") {
      return new Response("Hello, World!", {
        headers: { "Content-Type": "text/plain" },
      });
    } else if (path === "/v1/send-email" && method === "POST") {
      try {
        // Define the CORS headers
        const incomingOrigin = req.headers.get("Origin");
        // If there's an Origin header and it's not in the allowed list, throw an error.
        if (incomingOrigin && !allowedOrigins.includes(incomingOrigin)) {
          return new Response(JSON.stringify({ error: "CORS: Not allowed" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }
        const headers = new Headers({
          "Access-Control-Allow-Origin": incomingOrigin as string,
          "Access-Control-Allow-Methods": "POST"
        });
        if (req.method === "OPTIONS") {
          return new Response(null, { status: 204, headers });
        }
        sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
        const data = await req.json();
        const msg = {
          to: data.recipient, // Change to your recipient
          from: "Ritz Shrivastav <hritika12245@gmail.com>", // Change to your verified sender
          subject: "Message Received – Thank You!",
          templateId: "d-7122b4b005f648798de3822bed90214a",
          dynamic_template_data: {
            name: data?.name ?? data.recipient.split("@")[0],
          },
        };
        const msg2 = {
          to: "hritika12245@gmail.com", // Change to your recipient
          from: "Ritz Shrivastav <hritika12245@gmail.com>", // Change to your verified sender
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
        headers.set("Content-Type", "plain/text");
        return new Response("Email sent!", { headers });
      } catch (error: any) {
        return new Response(
          JSON.stringify({ error: "Invalid response : " + error?.message }),
          {
            status: 400,
          }
        );
      }
    }

    return new Response("ALERT : Not found!", { status: 404 });
  },
});
