import { Server as SocketIOServer, Socket } from "socket.io";
import { RBACService } from "../services/rbac.service";

const rbacService = new RBACService();

export function registerSocketHandlers(io: SocketIOServer, socket: Socket) {
  const userId = socket.data.userId;

  // ============================================
  // WORKSPACE EVENTS
  // ============================================

  socket.on("join_workspace", async (data: { workspaceId: string }) => {
    try {
      const { workspaceId } = data;

      // Verify user has access to workspace
      const hasAccess = await rbacService.hasWorkspaceRole(
        workspaceId,
        userId,
        "viewer" as any
      );

      if (!hasAccess) {
        socket.emit("error", { message: "No access to this workspace" });
        return;
      }

      // Join workspace room
      socket.join(`workspace:${workspaceId}`);
      console.log(`📁 User ${userId} joined workspace:${workspaceId}`);

      // Notify others in the workspace
      socket.to(`workspace:${workspaceId}`).emit("user_joined_workspace", {
        userId,
        username: socket.data.username,
        workspaceId,
      });

      // Confirm to the user
      socket.emit("workspace_joined", { workspaceId });
    } catch (error) {
      console.error("Error joining workspace:", error);
      socket.emit("error", { message: "Failed to join workspace" });
    }
  });

  socket.on("leave_workspace", (data: { workspaceId: string }) => {
    const { workspaceId } = data;
    socket.leave(`workspace:${workspaceId}`);
    console.log(`📁 User ${userId} left workspace:${workspaceId}`);

    // Notify others
    socket.to(`workspace:${workspaceId}`).emit("user_left_workspace", {
      userId,
      username: socket.data.username,
      workspaceId,
    });
  });

  // ============================================
  // PROJECT EVENTS
  // ============================================

  socket.on("join_project", async (data: { projectId: string }) => {
    try {
      const { projectId } = data;

      // Verify user has access to project
      const hasAccess = await rbacService.canAccessProject(projectId, userId);

      if (!hasAccess) {
        socket.emit("error", { message: "No access to this project" });
        return;
      }

      // Join project room
      socket.join(`project:${projectId}`);
      console.log(`📊 User ${userId} joined project:${projectId}`);

      // Get current users in project
      const socketsInRoom = await io.in(`project:${projectId}`).fetchSockets();
      const activeUsers = socketsInRoom.map((s) => ({
        userId: s.data.userId,
        username: s.data.username,
        socketId: s.id,
      }));

      // Notify others that user joined
      socket.to(`project:${projectId}`).emit("user_joined_project", {
        userId,
        username: socket.data.username,
        projectId,
      });

      // Send active users list to the joining user
      socket.emit("project_joined", {
        projectId,
        activeUsers,
      });
    } catch (error) {
      console.error("Error joining project:", error);
      socket.emit("error", { message: "Failed to join project" });
    }
  });

  socket.on("leave_project", (data: { projectId: string }) => {
    const { projectId } = data;
    socket.leave(`project:${projectId}`);
    console.log(`📊 User ${userId} left project:${projectId}`);

    // Notify others
    socket.to(`project:${projectId}`).emit("user_left_project", {
      userId,
      username: socket.data.username,
      projectId,
    });
  });

  // ============================================
  // TASK EVENTS (Real-time collaboration)
  // ============================================

  // User is viewing a specific task
  socket.on("viewing_task", (data: { taskId: string; projectId: string }) => {
    const { taskId, projectId } = data;

    socket.join(`task:${taskId}`);

    // Notify others viewing the same task
    socket.to(`task:${taskId}`).emit("user_viewing_task", {
      userId,
      username: socket.data.username,
      taskId,
    });

    console.log(`👁️ User ${userId} viewing task:${taskId}`);
  });

  socket.on("stop_viewing_task", (data: { taskId: string }) => {
    const { taskId } = data;
    socket.leave(`task:${taskId}`);

    socket.to(`task:${taskId}`).emit("user_stopped_viewing_task", {
      userId,
      taskId,
    });
  });

  // User is typing a comment
  socket.on("typing_comment", (data: { taskId: string }) => {
    const { taskId } = data;

    socket.to(`task:${taskId}`).emit("user_typing_comment", {
      userId,
      username: socket.data.username,
      taskId,
    });
  });

  socket.on("stopped_typing_comment", (data: { taskId: string }) => {
    const { taskId } = data;

    socket.to(`task:${taskId}`).emit("user_stopped_typing_comment", {
      userId,
      taskId,
    });
  });

  // ============================================
  // NOTIFICATION EVENTS
  // ============================================

  socket.on("mark_notification_read", (data: { notificationId: string }) => {
    // Handle notification read status
    // This would typically update a notifications table in the database
    console.log(
      `📬 Notification ${data.notificationId} marked as read by ${userId}`
    );
  });

  // ============================================
  // PRESENCE EVENTS
  // ============================================

  socket.on("update_status", (data: { status: "online" | "away" | "busy" }) => {
    // Broadcast status update to all rooms user is in
    const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);

    rooms.forEach((room) => {
      socket.to(room).emit("user_status_changed", {
        userId,
        username: socket.data.username,
        status: data.status,
      });
    });

    console.log(`👤 User ${userId} status changed to ${data.status}`);
  });
}
