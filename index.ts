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
        const data = await req.json();
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ error: "Invalid response" }), {
          status: 400,
        });
      }
    }

    return new Response("Not found!", { status: 404 });
  },
});
