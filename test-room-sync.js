#!/usr/bin/env node

/**
 * Test Script: Room Sync Bug Verification
 * Tests the critical bug where host doesn't see joined clients
 */

const WebSocket = require('ws');

const SERVER_URL = 'ws://localhost:3004';

let hostWs, clientWs;
let roomCode = '';

function log(prefix, message) {
  console.log(`[${prefix}] ${message}`);
}

function connect(name) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(SERVER_URL);
    
    ws.on('open', () => {
      log(name, '🔗 Connected to server');
      // Set player name
      ws.send(JSON.stringify({
        type: 'change_name',
        newName: name
      }));
      resolve(ws);
    });
    
    ws.on('error', (error) => {
      log(name, `❌ Connection error: ${error.message}`);
      reject(error);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        log(name, `📨 Received: ${message.type}`);
        
        if (message.type === 'name_changed') {
          log(name, `✅ Name changed to: ${message.newName}`);
        }
        
        if (message.type === 'error') {
          log(name, `❌ Error: ${message.error}`);
        }
        
        if (message.type === 'room_joined') {
          roomCode = message.room.id;
          log(name, `🚪 Joined room: ${message.room.name} (ID: ${roomCode})`);
          log(name, `👥 Players in room: ${message.room.players.length}`);
          message.room.players.forEach(p => {
            log(name, `  - ${p.name} (${p.isHost ? 'HOST' : 'player'})`);
          });
        }
        
        if (message.type === 'room_updated') {
          log(name, `🔄 Room updated - Players: ${message.room.players.length}`);
          message.room.players.forEach(p => {
            log(name, `  - ${p.name} (${p.isHost ? 'HOST' : 'player'})`);
          });
        }
      } catch (error) {
        log(name, `❌ Failed to parse message: ${error.message}`);
      }
    });
    
    return ws;
  });
}

async function testRoomSync() {
  try {
    log('TEST', '🧪 Starting Room Sync Bug Test');
    
    // Step 1: Connect host
    log('TEST', '1️⃣ Connecting host...');
    hostWs = await connect('TestHost');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Create room
    log('TEST', '2️⃣ Creating room...');
    hostWs.send(JSON.stringify({
      type: 'create_room',
      playerName: 'TestHost',
      roomName: 'Sync Test Room',
      settings: {
        maxPlayers: 4,
        gameSpeed: 'normal',
        allowSpectators: false
      }
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Connect client
    log('TEST', '3️⃣ Connecting client...');
    clientWs = await connect('TestClient');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 4: Join room
    log('TEST', '4️⃣ Client joining room...');
    clientWs.send(JSON.stringify({
      type: 'join_room',
      playerName: 'TestClient',
      roomId: roomCode
    }));
    
    // Wait for messages to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    log('TEST', '✅ Test completed - Check output above for sync status');
    log('TEST', '🔍 Expected: Both host and client should see 2 players');
    
  } catch (error) {
    log('TEST', `❌ Test failed: ${error.message}`);
  } finally {
    if (hostWs) hostWs.close();
    if (clientWs) clientWs.close();
    process.exit(0);
  }
}

testRoomSync();
