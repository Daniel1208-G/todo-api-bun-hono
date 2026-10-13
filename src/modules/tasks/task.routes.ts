import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  TaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskParamsSchema,
  TaskQuerySchema,
  ErrorSchema,
} from "./task.schema";
import { TaskRepository } from "./task.repository";

export const taskRouter = new OpenAPIHono();

function mapTask(t: any) {
  return {
    ...t,
    completed: Boolean(t.completed),
  };
}

// 1. GET /tasks
const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Tasks"],
  summary: "Listar tareas con filtro opcional",
  security: [{ BearerAuth: [] }],
  request: { query: TaskQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: z.array(TaskSchema) } }, description: "Listado de tareas" },
    401: { content: { "application/json": { schema: ErrorSchema } }, description: "No autorizado" },
  },
});

taskRouter.openapi(listRoute, (c) => {
  const { completed } = c.req.valid("query");
  const completedFilter = completed !== undefined ? completed === "true" : undefined;
  const tasks = TaskRepository.getAll(completedFilter).map(mapTask);
  return c.json(tasks, 200);
});

// 2. GET /tasks/{id}
const getByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Tasks"],
  summary: "Obtener detalle de una tarea",
  security: [{ BearerAuth: [] }],
  request: { params: TaskParamsSchema },
  responses: {
    200: { content: { "application/json": { schema: TaskSchema } }, description: "Detalle de la tarea" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Tarea no encontrada" },
    401: { content: { "application/json": { schema: ErrorSchema } }, description: "No autorizado" },
  },
});

taskRouter.openapi(getByIdRoute, (c) => {
  const { id } = c.req.valid("param");
  const task = TaskRepository.getById(Number(id));
  if (!task) return c.json({ message: "Tarea no encontrada" }, 404);
  return c.json(mapTask(task), 200);
});

// 3. POST /tasks
const createRouteContract = createRoute({
  method: "post",
  path: "/",
  tags: ["Tasks"],
  summary: "Crear una nueva tarea",
  security: [{ BearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: CreateTaskSchema } } } },
  responses: {
    201: { content: { "application/json": { schema: TaskSchema } }, description: "Tarea creada exitosamente" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Datos de entrada inválidos" },
    401: { content: { "application/json": { schema: ErrorSchema } }, description: "No autorizado" },
  },
});

taskRouter.openapi(createRouteContract, (c) => {
  const body = c.req.valid("json");
  const newTask = TaskRepository.create(body.title, body.description);
  return c.json(mapTask(newTask), 201);
});

// 4. PATCH /tasks/{id}
const updateRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Tasks"],
  summary: "Actualizar parcialmente una tarea",
  security: [{ BearerAuth: [] }],
  request: {
    params: TaskParamsSchema,
    body: { content: { "application/json": { schema: UpdateTaskSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: TaskSchema } }, description: "Tarea actualizada" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Tarea no encontrada" },
    401: { content: { "application/json": { schema: ErrorSchema } }, description: "No autorizado" },
  },
});

taskRouter.openapi(updateRoute, (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const updated = TaskRepository.update(Number(id), body);
  if (!updated) return c.json({ message: "Tarea no encontrada" }, 404);
  return c.json(mapTask(updated), 200);
});

// 5. DELETE /tasks/{id}
const deleteRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Tasks"],
  summary: "Eliminar una tarea",
  security: [{ BearerAuth: [] }],
  request: { params: TaskParamsSchema },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Tarea eliminada" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Tarea no encontrada" },
    401: { content: { "application/json": { schema: ErrorSchema } }, description: "No autorizado" },
  },
});

taskRouter.openapi(deleteRoute, (c) => {
  const { id } = c.req.valid("param");
  const deleted = TaskRepository.delete(Number(id));
  if (!deleted) return c.json({ message: "Tarea no encontrada" }, 404);
  return c.json({ message: "Tarea eliminada exitosamente" }, 200);
});