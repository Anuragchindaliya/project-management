import http from "http";
import app from "./app";
import { initializeSocketIO } from "./socket";
import { setSocketIO } from "./socket/emitters";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocketIO(server);
setSocketIO(io);

server.listen(PORT, () => {
  console.log(`
    🚀 Server running on port ${PORT}
    📝 Environment: ${process.env.NODE_ENV || "development"}
    🔗 API: http://localhost:${PORT}
    🔌 WebSocket: ws://localhost:${PORT}
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

export { io };
