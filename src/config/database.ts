import { Database } from "bun:sqlite";

export const db = new Database("tasks.sqlite", { create: true });
db.exec("PRAGMA journal_mode = WAL;");

export function initDatabase(): void {
  const query = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.exec(query);
  console.log(" Base de datos SQLite lista con la tabla 'tasks'.");
}