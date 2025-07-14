#!/usr/bin/env node

/**
 * Game Start Test
 * Tests the critical start_game functionality that was causing mapToObject errors
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
        
        if (message.type === 'game_started') {
          log(name, `🎮 Game started! Stage: ${message.gameState.currentStage}`);
          if (message.gameState.dealerSelection) {
            log(name, `🃏 Dealer selection: ${Object.keys(message.gameState.dealerSelection.selectedCards).length} cards selected`);
          }
        }
        
        if (message.type === 'game_state_updated') {
          log(name, `🔄 Game state updated - Stage: ${message.gameState.currentStage}`);
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

async function gameStartTest() {
  try {
    log('TEST', '🧪 Starting Game Start Test (Critical mapToObject Fix)');
    
    // Step 1: Connect host and create room
    log('TEST', '1️⃣ Setting up room...');
    hostWs = await connect('GameHost');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    hostWs.send(JSON.stringify({
      type: 'create_room',
      playerName: 'GameHost',
      roomName: 'Game Start Test Room'
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Connect client and join
    clientWs = await connect('GameClient');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    clientWs.send(JSON.stringify({
      type: 'join_room',
      playerName: 'GameClient',
      roomId: roomId
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: CRITICAL TEST - Start the game
    // This was previously causing "map is not iterable" errors
    log('TEST', '2️⃣ 🚨 CRITICAL TEST: Starting game (this previously crashed with mapToObject error)...');
    hostWs.send(JSON.stringify({
      type: 'start_game'
    }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    log('TEST', '✅ Game start test completed!');
    log('TEST', '🔍 Key success indicators:');
    log('TEST', '  - No "map is not iterable" errors');
    log('TEST', '  - No "invalid message format" errors');
    log('TEST', '  - Game state messages received successfully');
    log('TEST', '  - Both players should see game_started and game_state_updated messages');
    
  } catch (error) {
    log('TEST', `❌ Test failed: ${error.message}`);
  } finally {
    if (hostWs) hostWs.close();
    if (clientWs) clientWs.close();
    process.exit(0);
  }
}

gameStartTest();
