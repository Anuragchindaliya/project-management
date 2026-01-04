// server/src/services/task.service.ts
import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { tasks } from "../db/schema";
import { io } from "../index";

class TaskService {
  async updateTask(
    taskId: string,
    data: UpdateTaskData,
    userId: string
  ): Promise<Task> {
    // Update in DB
    await db.update(tasks).set(data).where(eq(tasks.id, taskId)).execute();
    const updatedTaskArray = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .execute();
    const updatedTask = updatedTaskArray[0];

    // Emit Socket.io event
    io.to(`project:${updatedTask.projectId}`).emit("task_updated", updatedTask);

    return updatedTask;
  }
}
