import { db } from "../../config/database";

export interface TaskRecord {
  id: number;
  title: string;
  description: string | null;
  completed: number;
  created_at: string;
  updated_at: string;
}

export class TaskRepository {
  static getAll(completedFilter?: boolean): TaskRecord[] {
    if (completedFilter !== undefined) {
      const stmt = db.query<TaskRecord, [number]>(
        "SELECT * FROM tasks WHERE completed = ? ORDER BY id DESC"
      );
      return stmt.all(completedFilter ? 1 : 0);
    }
    const stmt = db.query<TaskRecord, []>("SELECT * FROM tasks ORDER BY id DESC");
    return stmt.all();
  }

  static getById(id: number): TaskRecord | null {
    const stmt = db.query<TaskRecord, [number]>("SELECT * FROM tasks WHERE id = ?");
    return stmt.get(id);
  }

  static create(title: string, description?: string): TaskRecord {
    const stmt = db.query<TaskRecord, [string, string | null]>(`
      INSERT INTO tasks (title, description, completed, created_at, updated_at)
      VALUES (?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `);
    return stmt.get(title, description ?? null)!;
  }

  static update(id: number, data: { title?: string; description?: string; completed?: boolean }): TaskRecord | null {
    const current = this.getById(id);
    if (!current) return null;

    const newTitle = data.title !== undefined ? data.title : current.title;
    const newDesc = data.description !== undefined ? data.description : current.description;
    const newCompleted = data.completed !== undefined ? (data.completed ? 1 : 0) : current.completed;

    const stmt = db.query<TaskRecord, [string, string | null, number, number]>(`
      UPDATE tasks 
      SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *;
    `);
    return stmt.get(newTitle, newDesc, newCompleted, id);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare("DELETE FROM tasks WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }
}