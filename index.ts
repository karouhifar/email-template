import sgMail from "@sendgrid/mail";




const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

Bun.serve({
  port: PORT,
  async fetch(req) {
    const { url, method } = req;
    const path = new URL(url).pathname;

    if (path === "/" && method === "GET") {
      return new Response("Hello, World!", {
        headers: { "Content-Type": "text/plain" },
      });
    } else if (path === "/send-email" && method === "POST") {
      try {
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
            "Message from " + (data?.name ? ( data?.name + "<" + data.recipient + ">") : data.recipient),
          text: data.message,
          html: `<strong>${data.message} - LinkedIn : ${data?.LinkedIn ?? "Not Provided"}</strong>`,
        };
       const res = await sgMail.send(msg);
       const received = await sgMail.send(msg2);
       if (!res || !received) throw new Error("Invalid response"); 
        return new Response("Email sent!", {
          headers: { "Content-Type": "text/plain" },
        });
      } catch (error: any) {
        return new Response(
          JSON.stringify({ error: "Invalid response : " + error?.message }),
          {
            status: 400,
          }
        );
      }
    }

    return new Response("Not found!", { status: 404 });
  },
});
