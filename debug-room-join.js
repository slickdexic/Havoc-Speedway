// Debug script to trace room join issue
const WebSocket = require('ws');

let hostWs, clientWs;
let hostRoom = null;

console.log('🔍 DEBUGGING ROOM JOIN ISSUE');
console.log('===============================');

// Step 1: Host connects and creates room
function connectHost() {
  console.log('\n📡 Step 1: Host connecting...');
  hostWs = new WebSocket('ws://localhost:3003');
  
  hostWs.on('open', () => {
    console.log('✅ Host connected');
    
    // Create room
    console.log('🏠 Host creating room...');
    hostWs.send(JSON.stringify({
      type: 'create_room',
      roomName: 'Debug Room',
      playerName: 'DebugHost'
    }));
  });
  
  hostWs.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('📨 Host received:', message.type, JSON.stringify(message, null, 2));
    
    if (message.type === 'room_joined' || message.type === 'room_created') {
      hostRoom = message.room;
      console.log(`✅ Room created: ${hostRoom.name} (ID: ${hostRoom.id})`);
      console.log(`   Host players count: ${hostRoom.players.length}`);
      console.log(`   Host players:`, hostRoom.players.map(p => `${p.name} (${p.id.slice(0,8)})`));
      
      // Wait a bit, then connect client
      setTimeout(connectClient, 1000);
    }
    
    if (message.type === 'room_updated') {
      console.log(`🔄 Host sees room update:`);
      console.log(`   Players count: ${message.room.players.length}`);
      console.log(`   Players:`, message.room.players.map(p => `${p.name} (${p.id.slice(0,8)})`));
    }
    
    if (message.type === 'error') {
      console.log('❌ Host error:', message.message);
    }
  });
  
  hostWs.on('error', (error) => {
    console.log('❌ Host connection error:', error);
  });
}

// Step 2: Client connects and joins room
function connectClient() {
  console.log('\n📡 Step 2: Client connecting...');
  clientWs = new WebSocket('ws://localhost:3003');
  
  clientWs.on('open', () => {
    console.log('✅ Client connected');
    
    // Join room
    console.log('🚪 Client joining room...');
    clientWs.send(JSON.stringify({
      type: 'join_room',
      roomId: hostRoom.id,
      playerName: 'DebugClient'
    }));
  });
  
  clientWs.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('📨 Client received:', message.type, JSON.stringify(message, null, 2));
    
    if (message.type === 'room_joined') {
      console.log(`✅ Client joined room: ${message.room.name}`);
      console.log(`   Client sees players count: ${message.room.players.length}`);
      console.log(`   Client sees players:`, message.room.players.map(p => `${p.name} (${p.id.slice(0,8)})`));
    }
    
    if (message.type === 'room_updated') {
      console.log(`🔄 Client sees room update:`);
      console.log(`   Players count: ${message.room.players.length}`);
      console.log(`   Players:`, message.room.players.map(p => `${p.name} (${p.id.slice(0,8)})`));
    }
    
    if (message.type === 'error') {
      console.log('❌ Client error:', message.message);
    }
  });
  
  clientWs.on('error', (error) => {
    console.log('❌ Client connection error:', error);
  });
}

// Step 3: Summary after everything
function printSummary() {
  console.log('\n📊 SUMMARY AFTER 5 SECONDS:');
  console.log('============================');
  console.log('Expected: Host sees 2 players (DebugHost + DebugClient)');
  console.log('Expected: Client sees 2 players (DebugHost + DebugClient)');
  console.log('If host only sees 1 player, the broadcast is broken');
  console.log('If client sees 2 but host sees 1, room_updated not reaching host');
  
  // Test if both connections are still alive
  setTimeout(() => {
    console.log('\n🧪 Testing connections:');
    if (hostWs && hostWs.readyState === 1) {
      console.log('   Host connection: ALIVE');
    } else {
      console.log('   Host connection: DEAD');
    }
    
    if (clientWs && clientWs.readyState === 1) {
      console.log('   Client connection: ALIVE');
    } else {
      console.log('   Client connection: DEAD');
    }
  }, 100);
}

// Start the test
connectHost();

// Print summary after 3 seconds
setTimeout(printSummary, 3000);

// Close connections after 8 seconds
setTimeout(() => {
  if (hostWs) hostWs.close();
  if (clientWs) clientWs.close();
  process.exit(0);
}, 8000);
