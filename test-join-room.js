// Test joining an existing room
const WebSocket = require('ws');

console.log('🧪 Testing room creation and joining...');

// Create room with first client
const ws1 = new WebSocket('ws://localhost:3003');
let roomId = '';

ws1.on('open', () => {
  console.log('✅ Player 1 connected');
  
  const createRoomMessage = {
    type: 'create_room',
    roomName: 'Test Room',
    playerName: 'Player 1'
  };
  
  console.log('📤 Player 1 creating room...');
  ws1.send(JSON.stringify(createRoomMessage));
});

ws1.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('📨 Player 1 received:', message.type);
  
  if (message.type === 'room_created') {
    roomId = message.roomId;
    console.log('🏠 Room created with ID:', roomId.substring(0, 8) + '...');
    
    // Now connect second player
    setTimeout(() => {
      const ws2 = new WebSocket('ws://localhost:3003');
      
      ws2.on('open', () => {
        console.log('✅ Player 2 connected');
        
        const joinMessage = {
          type: 'join_room',
          roomId: roomId,
          playerName: 'Player 2'
        };
        
        console.log('📤 Player 2 joining room...');
        ws2.send(JSON.stringify(joinMessage));
      });
      
      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString());
        console.log('📨 Player 2 received:', message.type);
        
        if (message.type === 'game_state_update') {
          console.log('🎮 Game state - Players:', message.gameState.players.length);
          message.gameState.players.forEach(p => {
            console.log(`  - ${p.name}: ${p.isConnected ? 'Connected' : 'Disconnected'}`);
          });
        }
      });
      
      setTimeout(() => {
        console.log('🔚 Closing connections...');
        ws2.close();
        ws1.close();
      }, 2000);
    }, 1000);
  }
});

ws1.on('error', (error) => {
  console.error('❌ Player 1 error:', error);
});
