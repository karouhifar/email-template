// src/config/cors.ts
export const allowedOrigins = new Set<string>([
  ...process.env.CORS_ORIGINS!.split(",").map((o) => o.trim()),
  "http://localhost:8000",
]);
/**
 * Build CORS headers for the given Origin.
 */
export function buildCorsHeaders(origin: string | null) {
  const headers = new Headers();
  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
  return headers;
}
