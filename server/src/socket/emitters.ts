import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer;

export function setSocketIO(socketServer: SocketIOServer) {
  io = socketServer;
}

export function getSocketIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

// Emit task created event
export function emitTaskCreated(projectId: string, task: any, userId: string) {
  io.to(`project:${projectId}`).emit("task_created", {
    task,
    createdBy: userId,
    timestamp: new Date(),
  });
}

// Emit task updated event
export function emitTaskUpdated(
  projectId: string,
  task: any,
  changes: any,
  userId: string
) {
  io.to(`project:${projectId}`).emit("task_updated", {
    task,
    changes,
    updatedBy: userId,
    timestamp: new Date(),
  });
}

// Emit task deleted event
export function emitTaskDeleted(
  projectId: string,
  taskId: string,
  userId: string
) {
  io.to(`project:${projectId}`).emit("task_deleted", {
    taskId,
    deletedBy: userId,
    timestamp: new Date(),
  });
}

// Emit task assigned event (to specific user)
export function emitTaskAssigned(
  assigneeId: string,
  task: any,
  assignedBy: string
) {
  io.to(`user:${assigneeId}`).emit("task_assigned", {
    task,
    assignedBy,
    timestamp: new Date(),
  });
}

// Emit comment added event
export function emitCommentAdded(
  taskId: string,
  projectId: string,
  comment: any,
  userId: string
) {
  io.to(`task:${taskId}`).emit("comment_added", {
    comment,
    addedBy: userId,
    timestamp: new Date(),
  });

  // Also emit to project room for activity feed
  io.to(`project:${projectId}`).emit("project_activity", {
    type: "comment_added",
    taskId,
    comment,
    userId,
    timestamp: new Date(),
  });
}

// Emit project updated event
export function emitProjectUpdated(
  workspaceId: string,
  project: any,
  userId: string
) {
  io.to(`workspace:${workspaceId}`).emit("project_updated", {
    project,
    updatedBy: userId,
    timestamp: new Date(),
  });
}

// Emit workspace updated event
export function emitWorkspaceUpdated(
  workspaceId: string,
  workspace: any,
  userId: string
) {
  io.to(`workspace:${workspaceId}`).emit("workspace_updated", {
    workspace,
    updatedBy: userId,
    timestamp: new Date(),
  });
}
