// Main server entry point

import { WebSocketServer } from 'ws';
import { GameServer } from './game/GameServer.js';
import { MessageHandler } from './network/MessageHandler.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3003;

console.log('🎮 Starting Havoc Speedway Server...');
console.log('🚀 Port:', PORT);

// Create WebSocket server
const wss = new WebSocketServer({ 
  port: PORT,
  host: '0.0.0.0'
});

// Create game server instance
const gameServer = new GameServer();
const messageHandler = new MessageHandler(gameServer);

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`🔌 Client connected from ${clientIp}`);
  
  // Register client with message handler
  messageHandler.handleConnection(ws);
  
  ws.on('close', () => {
    console.log(`🔌 Client disconnected from ${clientIp}`);
    messageHandler.handleDisconnection(ws);
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

wss.on('listening', () => {
  console.log(`🚀 Havoc Speedway Server listening on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
});

wss.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  wss.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  wss.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});
// Force restart
