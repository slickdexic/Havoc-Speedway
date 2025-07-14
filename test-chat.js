#!/usr/bin/env node

/**
 * Chat Functionality Test
 * Tests both public and private chat messages
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
        
        if (message.type === 'room_joined') {
          roomId = message.room.id;
          log(name, `🚪 Joined room: ${message.room.name}`);
        }
        
        if (message.type === 'message_received') {
          const chatType = message.isPrivate ? 'PRIVATE' : 'PUBLIC';
          log(name, `💬 [${chatType}] ${message.sender}: ${message.content}`);
        }
        
        if (message.type === 'error') {
          log(name, `❌ Error: ${message.error}`);
        }
        
      } catch (error) {
        log(name, `❌ Failed to parse message: ${error.message}`);
      }
    });
    
    return ws;
  });
}

async function chatTest() {
  try {
    log('TEST', '🧪 Starting Chat Functionality Test');
    
    // Step 1: Connect host and create room
    log('TEST', '1️⃣ Setting up room...');
    hostWs = await connect('ChatHost');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    hostWs.send(JSON.stringify({
      type: 'create_room',
      playerName: 'ChatHost',
      roomName: 'Chat Test Room'
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Connect client and join
    clientWs = await connect('ChatClient');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    clientWs.send(JSON.stringify({
      type: 'join_room',
      playerName: 'ChatClient',
      roomId: roomId
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Test public chat from host
    log('TEST', '2️⃣ Testing public chat from host...');
    hostWs.send(JSON.stringify({
      type: 'send_message',
      content: 'Hello from the host! This is a public message.'
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 4: Test public chat from client
    log('TEST', '3️⃣ Testing public chat from client...');
    clientWs.send(JSON.stringify({
      type: 'send_message',
      content: 'Hi back from the client! Public message response.'
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 5: Test private chat (this should fail gracefully since we don't have target player IDs)
    log('TEST', '4️⃣ Testing private chat (expect error)...');
    hostWs.send(JSON.stringify({
      type: 'send_message',
      content: 'This is a private message',
      isPrivate: true,
      targetPlayerId: 'nonexistent-player-id'
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 6: Test empty message (should error)
    log('TEST', '5️⃣ Testing empty message (expect error)...');
    hostWs.send(JSON.stringify({
      type: 'send_message',
      content: ''
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    log('TEST', '✅ Chat test completed - Check output above for:');
    log('TEST', '🔍 1. Both players should see public messages from each other');
    log('TEST', '🔍 2. Private message should fail (no target player ID)');
    log('TEST', '🔍 3. Empty message should be rejected with error');
    log('TEST', '🔍 4. No "invalid message format" errors should appear');
    
  } catch (error) {
    log('TEST', `❌ Test failed: ${error.message}`);
  } finally {
    if (hostWs) hostWs.close();
    if (clientWs) clientWs.close();
    process.exit(0);
  }
}

chatTest();
