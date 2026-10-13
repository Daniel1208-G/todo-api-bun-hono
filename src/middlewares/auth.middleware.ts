import type { Context, Next } from "hono";

const VALID_API_TOKEN = (process.env.API_TOKEN || "secreto_claro_2026").trim();

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "No autorizado. Formato requerido: Bearer <token>" }, 401);
  }

  // Extraer token, eliminar espacios en blanco accidentales y comillas sobrantes
  const token = authHeader.replace(/^Bearer\s+/i, "").trim().replace(/^["']|["']$/g, "");

  if (token !== VALID_API_TOKEN) {
    return c.json({ message: "Token inválido o expirado" }, 401);
  }

  await next();
}