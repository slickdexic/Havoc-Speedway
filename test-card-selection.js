#!/usr/bin/env node

/**
 * Dealer Selection Card Click Test
 * Tests the specific card selection functionality that was reported as broken
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
          log(name, `🎮 Game started! Stage: ${message.gameState.stage}`);
          if (message.gameState.dealerSelection) {
            log(name, `🃏 Found ${message.gameState.dealerSelection.dealerCards.length} dealer cards`);
            log(name, `🔄 Current selecting player: ${message.gameState.dealerSelection.currentSelectingPlayerId}`);
          }
        }
        
        if (message.type === 'game_state_updated') {
          log(name, `🔄 Game state updated - Stage: ${message.gameState.stage}`);
          if (message.gameState.dealerSelection) {
            const selectedCount = Object.keys(message.gameState.dealerSelection.selectedCards).length;
            log(name, `🃏 Cards selected by players: ${selectedCount}`);
            log(name, `🔄 Current selecting player: ${message.gameState.dealerSelection.currentSelectingPlayerId}`);
            
            // Log the first few dealer cards for debugging
            const cards = message.gameState.dealerSelection.dealerCards.slice(0, 3);
            cards.forEach((card, index) => {
              log(name, `📋 Card ${index + 1}: ${card.rank} of ${card.suit} (${card.isFlipped ? 'REVEALED' : 'face-down'}) ID: ${card.id}`);
            });
          }
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

async function cardSelectionTest() {
  try {
    log('TEST', '🧪 Starting Card Selection Test');
    
    // Step 1: Connect host and create room
    log('TEST', '1️⃣ Setting up room...');
    hostWs = await connect('CardHost');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    hostWs.send(JSON.stringify({
      type: 'create_room',
      playerName: 'CardHost',
      roomName: 'Card Selection Test Room'
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Connect client and join
    clientWs = await connect('CardClient');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    clientWs.send(JSON.stringify({
      type: 'join_room',
      playerName: 'CardClient',
      roomId: roomId
    }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Start the game to get to dealer selection
    log('TEST', '2️⃣ Starting game to reach dealer selection...');
    hostWs.send(JSON.stringify({
      type: 'start_game'
    }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: CRITICAL TEST - Try to select a card
    log('TEST', '3️⃣ 🚨 CRITICAL TEST: Attempting to select first card...');
    
    // Use the correct message format for player actions
    hostWs.send(JSON.stringify({
      type: 'player_action',
      action: {
        type: 'SELECT_DEALER_CARD',
        playerId: 'CardHost',
        cardId: 'card-0' // Try the first card
      }
    }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Step 5: Try with a different card ID format
    log('TEST', '4️⃣ Trying alternative card selection...');
    hostWs.send(JSON.stringify({
      type: 'player_action',
      action: {
        type: 'SELECT_DEALER_CARD',
        playerId: 'CardHost',
        cardId: 'dealer-card-1' // Alternative ID format
      }
    }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    log('TEST', '✅ Card selection test completed!');
    log('TEST', '🔍 Look for:');
    log('TEST', '  - Cards being revealed/flipped');
    log('TEST', '  - Selected cards appearing in player areas');
    log('TEST', '  - Current selecting player changing to next player');
    log('TEST', '  - No errors about invalid card IDs');
    
  } catch (error) {
    log('TEST', `❌ Test failed: ${error.message}`);
  } finally {
    if (hostWs) hostWs.close();
    if (clientWs) clientWs.close();
    process.exit(0);
  }
}

cardSelectionTest();
