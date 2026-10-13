import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { initDatabase } from "./config/database";
import { taskRouter } from "./modules/tasks/task.routes";
import { authMiddleware } from "./middlewares/auth.middleware";

initDatabase();

const app = new OpenAPIHono();

app.use("/tasks/*", authMiddleware);
app.use("/tasks", authMiddleware);

app.route("/tasks", taskRouter);

app.openAPIRegistry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Ingresa el token de prueba: secreto_claro_2026",
});

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "API REST To-Do List - Bun + Hono + SQLite",
    version: "1.0.0",
    description: "API construida con validación estricta y persistencia relacional.",
  },
});

app.get(
  "/docs",
  apiReference({
    theme: "purple",
    spec: { url: "/doc" },
  })
);

app.get("/", (c) => {
  return c.html(`
    <h2>API REST de Tareas en Ejecución</h2>
    <p>Para ver y probar la API entra a: <a href="/docs">/docs</a></p>
  `);
});

const PORT = 3000;
console.log(` Servidor corriendo en http://localhost:${PORT}`);
console.log(` Documentación interactiva en http://localhost:${PORT}/docs`);

export default {
  port: PORT,
  fetch: app.fetch,
};