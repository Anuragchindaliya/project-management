import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyAccessToken } from "../utils/jwt.util";
import { registerSocketHandlers } from "./handlers";

export function initializeSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      // Get token from handshake auth or query
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      // Verify JWT token
      const payload = verifyAccessToken(token as string);

      // Attach user info to socket
      socket.data.userId = payload.userId;
      socket.data.email = payload.email;
      socket.data.username = payload.username;

      next();
    } catch (error) {
      next(new Error("Invalid authentication token"));
    }
  });

  // Connection event
  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(`✅ User connected: ${userId} (${socket.id})`);

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Register all event handlers
    registerSocketHandlers(io, socket);

    // Disconnection event
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${userId} (${socket.id})`);
    });
  });

  return io;
}
