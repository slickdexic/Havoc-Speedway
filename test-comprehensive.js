#!/usr/bin/env node

/**
 * Comprehensive Test: Room Sync + Settings Test
 * Tests both the room sync bug AND the settings functionality
 */

const WebSocket = require('ws');

const SERVER_URL = 'ws://localhost:3003';

let hostWs, clientWs;
let roomId = '';

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
          roomId = message.room.id;
          log(name, `🚪 Joined room: ${message.room.name} (ID: ${roomId})`);
          log(name, `👥 Players in room: ${message.room.players.length}`);
          message.room.players.forEach(p => {
            log(name, `  - ${p.name} (${p.isHost ? 'HOST' : 'player'})`);
          });
          log(name, `⚙️ Settings: ${JSON.stringify(message.room.settings)}`);
        }
        
        if (message.type === 'room_updated') {
          log(name, `🔄 Room updated - Players: ${message.room.players.length}`);
          message.room.players.forEach(p => {
            log(name, `  - ${p.name} (${p.isHost ? 'HOST' : 'player'})`);
          });
          log(name, `⚙️ Updated Settings: ${JSON.stringify(message.room.settings)}`);
        }
      } catch (error) {
        log(name, `❌ Failed to parse message: ${error.message}`);
      }
    });
    
    return ws;
  });
}

async function comprehensiveTest() {
  try {
    log('TEST', '🧪 Starting Comprehensive Room + Settings Test');
    
    // Step 1: Connect host
    log('TEST', '1️⃣ Connecting host...');
    hostWs = await connect('TestHost');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Create room with specific settings
    log('TEST', '2️⃣ Creating room with settings...');
    hostWs.send(JSON.stringify({
      type: 'create_room',
      playerName: 'TestHost',
      roomName: 'Settings Test Room',
      settings: {
        numberOfLaps: 2,
        numberOfDice: 1,
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
      roomId: roomId
    }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 5: Test settings change
    log('TEST', '5️⃣ Host changing settings...');
    hostWs.send(JSON.stringify({
      type: 'change_settings',
      settings: {
        numberOfLaps: 5,
        numberOfDice: 2,
        maxPlayers: 3,
        gameSpeed: 'fast',
        allowSpectators: true
      }
    }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    log('TEST', '✅ Test completed - Check output above for:');
    log('TEST', '🔍 1. Both host and client should see 2 players');
    log('TEST', '🔍 2. Settings should update from [2 laps, 1 die] to [5 laps, 2 dice]');
    log('TEST', '🔍 3. Both players should see the same updated settings');
    
  } catch (error) {
    log('TEST', `❌ Test failed: ${error.message}`);
  } finally {
    if (hostWs) hostWs.close();
    if (clientWs) clientWs.close();
    process.exit(0);
  }
}

comprehensiveTest();
