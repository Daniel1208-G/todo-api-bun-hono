import { z } from "@hono/zod-openapi";

export const TaskSchema = z
  .object({
    id: z.number().int().openapi({ example: 1 }),
    title: z.string().min(3).openapi({ example: "Completar prueba técnica" }),
    description: z.string().nullable().optional().openapi({ example: "Desplegar API en Bun y Hono" }),
    completed: z.boolean().openapi({ example: false }),
    created_at: z.string().openapi({ example: "2026-10-13 14:00:00" }),
    updated_at: z.string().openapi({ example: "2026-10-13 14:00:00" }),
  })
  .openapi("Task");

export const CreateTaskSchema = z
  .object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres").openapi({ example: "Nueva tarea" }),
    description: z.string().optional().openapi({ example: "Descripción opcional" }),
  })
  .openapi("CreateTaskInput");

export const UpdateTaskSchema = z
  .object({
    title: z.string().min(3).optional().openapi({ example: "Título editado" }),
    description: z.string().optional().openapi({ example: "Descripción editada" }),
    completed: z.boolean().optional().openapi({ example: true }),
  })
  .openapi("UpdateTaskInput");

export const TaskParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID debe ser numérico").openapi({
    param: { name: "id", in: "path" },
    example: "1",
  }),
});

export const TaskQuerySchema = z.object({
  completed: z.enum(["true", "false"]).optional().openapi({
    param: { name: "completed", in: "query" },
    example: "false",
    description: "Filtrar por estado completado",
  }),
});

export const ErrorSchema = z
  .object({
    message: z.string().openapi({ example: "Recurso no encontrado" }),
  })
  .openapi("ErrorResponse");