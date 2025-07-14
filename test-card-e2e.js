#!/usr/bin/env node
import WebSocket from 'ws';

console.log('🎴 Testing card selection end-to-end...');

let host, client;
let hostId, clientId;
let roomId;

function connectAndTest() {
  return new Promise((resolve) => {
    host = new WebSocket('ws://localhost:3003');
    
    host.onopen = () => {
      console.log('🏠 Host connected');
      
      // Set name and create room
      host.send(JSON.stringify({ type: 'change_name', newName: 'TestHost' }));
      
      setTimeout(() => {
        host.send(JSON.stringify({
          type: 'create_room',
          playerName: 'TestHost',
          roomName: 'Card Test Room'
        }));
      }, 100);
    };
    
    host.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('🏠 Host received:', message.type);
      
      if (message.type === 'room_joined') {
        hostId = message.playerId;
        roomId = message.room.id;
        console.log('🏠 Host ID:', hostId);
        console.log('🏠 Room ID:', roomId);
        
        // Connect client
        client = new WebSocket('ws://localhost:3003');
        
        client.onopen = () => {
          console.log('👤 Client connected');
          client.send(JSON.stringify({ type: 'change_name', newName: 'TestClient' }));
          
          setTimeout(() => {
            client.send(JSON.stringify({
              type: 'join_room',
              playerName: 'TestClient',
              roomId: roomId
            }));
          }, 100);
        };
        
        client.onmessage = (event) => {
          const message = JSON.parse(event.data);
          console.log('👤 Client received:', message.type);
          
          if (message.type === 'room_joined') {
            clientId = message.playerId;
            console.log('👤 Client ID:', clientId);
            
            // Start game
            setTimeout(() => {
              console.log('🎮 Starting game...');
              host.send(JSON.stringify({ type: 'start_game' }));
            }, 500);
          }
          
          if (message.type === 'game_started' || message.type === 'game_state_update') {
            const gameState = message.gameState;
            
            if (gameState && gameState.dealerSelection) {
              console.log('🎴 Game state update:');
              console.log('  - Current stage:', gameState.currentStage);
              console.log('  - Current selector:', gameState.dealerSelection.currentSelectingPlayerId);
              console.log('  - Available cards:', gameState.dealerSelection.dealerCards?.filter(c => !c.isFlipped).length || 0);
              console.log('  - Players selected:', Object.keys(gameState.dealerSelection.selectedCards).length);
              
              // If it's client's turn and they haven't selected yet
              if (gameState.dealerSelection.currentSelectingPlayerId === clientId &&
                  !gameState.dealerSelection.selectedCards[clientId] &&
                  gameState.dealerSelection.dealerCards?.length > 0) {
                
                const firstAvailableCard = gameState.dealerSelection.dealerCards.find(c => !c.isFlipped);
                if (firstAvailableCard) {
                  console.log('👤 Client selecting card:', firstAvailableCard.id);
                  
                  setTimeout(() => {
                    client.send(JSON.stringify({
                      type: 'player_action',
                      action: {
                        type: 'SELECT_DEALER_CARD',
                        playerId: clientId,
                        cardId: firstAvailableCard.id
                      }
                    }));
                    console.log('✅ Client card selection sent');
                  }, 1000);
                }
              }
            }
          }
        };
      }
      
      if (message.type === 'game_started' || message.type === 'game_state_update') {
        const gameState = message.gameState;
        
        if (gameState && gameState.dealerSelection) {
          console.log('🏠 Host game state update:');
          console.log('  - Current selector:', gameState.dealerSelection.currentSelectingPlayerId);
          console.log('  - Available cards:', gameState.dealerSelection.dealerCards?.filter(c => !c.isFlipped).length || 0);
          
          // If it's host's turn and they haven't selected yet
          if (gameState.dealerSelection.currentSelectingPlayerId === hostId &&
              !gameState.dealerSelection.selectedCards[hostId] &&
              gameState.dealerSelection.dealerCards?.length > 0) {
            
            const firstAvailableCard = gameState.dealerSelection.dealerCards.find(c => !c.isFlipped);
            if (firstAvailableCard) {
              console.log('🏠 Host selecting card:', firstAvailableCard.id);
              
              setTimeout(() => {
                host.send(JSON.stringify({
                  type: 'player_action',
                  action: {
                    type: 'SELECT_DEALER_CARD',
                    playerId: hostId,
                    cardId: firstAvailableCard.id
                  }
                }));
                console.log('✅ Host card selection sent');
              }, 1000);
            }
          }
          
          // Check if dealer selection is complete
          if (gameState.dealerSelection.isComplete) {
            console.log('🎉 Dealer selection complete!');
            console.log('🎭 Dealer:', gameState.dealerSelection.dealerId);
            resolve();
          }
        }
      }
    };
    
    host.onerror = (error) => {
      console.error('🏠 Host error:', error);
    };
  });
}

async function runTest() {
  try {
    await connectAndTest();
    
    console.log('🧪 Test completed successfully!');
    
    setTimeout(() => {
      if (host) host.close();
      if (client) client.close();
      process.exit(0);
    }, 2000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTest();
