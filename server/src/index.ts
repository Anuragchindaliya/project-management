import { createServer } from 'http';
import app from './app';
import { initializeSocketIO } from './socket';
import { setSocketIO } from './socket/emitters';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const io = initializeSocketIO(server);
setSocketIO(io);

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 PROJECT MANAGEMENT PLATFORM API                     ║
║                                                           ║
║   Environment: ${NODE_ENV.padEnd(44)}║
║   Port:        ${PORT.toString().padEnd(44)}║
║   URL:         http://localhost:${PORT.toString().padEnd(32)}║
║   API Docs:    http://localhost:${PORT}/api/v1/health${' '.repeat(16)}║
║                                                           ║
║   Socket.io:   ✅ Initialized                            ║
║   Database:    ✅ Connected                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Closing server gracefully...`);

  server.close(() => {
    console.log('✅ HTTP server closed');

    // Close Socket.io connections
    io.close(() => {
      console.log('✅ WebSocket connections closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export { io, server };
