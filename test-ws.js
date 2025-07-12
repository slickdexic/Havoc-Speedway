// WebSocket test script
const WebSocket = require('ws');

console.log('🧪 Testing WebSocket connection to server...');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('✅ Connected to server');
  
  // Test room creation message
  const createRoomMessage = {
    type: 'create_room',
    roomName: 'Test Room',
    playerName: 'Test Player'
  };
  
  console.log('📤 Sending create_room message:', createRoomMessage);
  ws.send(JSON.stringify(createRoomMessage));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('📨 Received message:', JSON.stringify(message, null, 2));
});

ws.on('close', () => {
  console.log('🔌 Connection closed');
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

// Close connection after 5 seconds
setTimeout(() => {
  console.log('🔚 Closing test connection...');
  ws.close();
}, 5000);
