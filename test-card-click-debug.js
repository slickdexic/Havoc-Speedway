#!/usr/bin/env node

// Test card selection debug
import WebSocket from 'ws';

const HOST_URL = 'ws://localhost:3003';

async function testCardClickDebug() {
  console.log('🎴 Testing card click debug...');
  
  // Create two connections
  const host = new WebSocket(HOST_URL);
  const client = new WebSocket(HOST_URL);
  
  let hostId, clientId, roomId;
  
  // Host setup
  host.on('open', () => {
    console.log('📡 Host connected');
    host.send(JSON.stringify({ type: 'change_name', newName: 'DebugHost' }));
  });
  
  host.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('🏠 Host received:', message.type);
    
    if (message.type === 'lobby_update' && message.player) {
      hostId = message.player.id;
      console.log('🏠 Host ID:', hostId);
      
      // Create room
      host.send(JSON.stringify({
        type: 'create_room',
        playerName: 'DebugHost',
        roomName: 'Debug Card Selection'
      }));
    }
    
    if (message.type === 'room_created') {
      roomId = message.roomId;
      console.log('🏠 Room created:', roomId);
    }
    
    if (message.type === 'game_state' && message.gameState?.stage === 'dealer-selection') {
      console.log('🎴 Dealer selection started!');
      console.log('🎴 Available cards:', message.gameState.dealerSelection.dealerCards.length);
      console.log('🎴 Current selecting player:', message.gameState.dealerSelection.currentSelectingPlayerId);
      console.log('🎴 Host ID matches current selector?', message.gameState.dealerSelection.currentSelectingPlayerId === hostId);
      
      // Try to select first card
      setTimeout(() => {
        const firstCard = message.gameState.dealerSelection.dealerCards[0];
        console.log('🎴 Host attempting to select card:', firstCard.id);
        
        host.send(JSON.stringify({
          type: 'player_action',
          action: {
            type: 'SELECT_DEALER_CARD',
            playerId: hostId,
            cardId: firstCard.id
          }
        }));
      }, 1000);
    }
  });
  
  // Client setup  
  client.on('open', () => {
    console.log('📡 Client connected');
    client.send(JSON.stringify({ type: 'change_name', newName: 'DebugClient' }));
  });
  
  client.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('👤 Client received:', message.type);
    
    if (message.type === 'lobby_update' && message.player) {
      clientId = message.player.id;
      console.log('👤 Client ID:', clientId);
      
      // Wait a moment then join room
      setTimeout(() => {
        if (roomId) {
          client.send(JSON.stringify({
            type: 'join_room',
            playerName: 'DebugClient',
            roomId: roomId
          }));
        }
      }, 500);
    }
    
    if (message.type === 'game_state' && message.gameState?.stage === 'dealer-selection') {
      console.log('🎴 Client sees dealer selection');
      console.log('🎴 Current selecting player:', message.gameState.dealerSelection.currentSelectingPlayerId);
      console.log('🎴 Client ID matches current selector?', message.gameState.dealerSelection.currentSelectingPlayerId === clientId);
    }
  });
  
  // Start game after both join
  setTimeout(() => {
    console.log('🚀 Starting game...');
    host.send(JSON.stringify({ type: 'start_game' }));
  }, 2000);
  
  // Cleanup after test
  setTimeout(() => {
    console.log('🧹 Cleaning up...');
    host.close();
    client.close();
  }, 10000);
}

testCardClickDebug().catch(console.error);
