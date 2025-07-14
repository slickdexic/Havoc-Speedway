const WebSocket = require('ws');

let hostWs, clientWs;
let cardHostId, cardClientId;
let roomId;
let dealerCards = [];

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCardSelection() {
    console.log('🧪 Starting card selection test...');
    
    // Connect host
    hostWs = new WebSocket('ws://localhost:3003');
    
    await new Promise(resolve => {
        hostWs.on('open', () => {
            console.log('✅ CardHost connected');
            resolve();
        });
    });
    
    // Set up message handlers first
    hostWs.on('message', (data) => {
        const message = JSON.parse(data.toString());
        console.log('🏠 Host received:', message.type);
        
        if (message.type === 'room_joined') {
            roomId = message.room.id;
            // Find CardHost in the players array
            const hostPlayer = message.room.players.find(p => p.name === 'CardHost');
            if (hostPlayer) {
                cardHostId = hostPlayer.id;
                console.log('🏠 CardHost ID from room_joined:', cardHostId);
            }
            console.log('🏠 Room created:', roomId);
            // Now connect the client
            connectClient();
        }
        
        if (message.type === 'player_joined') {
            if (message.player.name === 'CardHost') {
                cardHostId = message.player.id;
                console.log('🏠 CardHost ID:', cardHostId);
            }
        }
        
        if (message.type === 'game_state_update' || message.type === 'game_started') {
            console.log('🎮 Game state update - stage:', message.gameState?.stage);
            
            // Store dealer cards
            if (message.gameState?.dealerSelection && message.gameState.dealerSelection.dealerCards) {
                dealerCards = message.gameState.dealerSelection.dealerCards;
                console.log('🎴 Dealer cards available:', dealerCards.length);
                console.log('🎴 First few card IDs:', dealerCards.slice(0, 3).map(c => c.id));
                
                // If it's our turn, select a card
                if (message.gameState.stage === 'dealer-selection' && 
                    message.gameState.dealerSelection.currentSelectingPlayerId === cardHostId) {
                    
                    console.log('🎯 CardHost turn! Selecting first card...');
                    console.log('🎯 Current selecting player:', message.gameState.dealerSelection.currentSelectingPlayerId);
                    console.log('🎯 CardHost ID:', cardHostId);
                    
                    setTimeout(() => {
                        const selectMessage = {
                            type: 'player_action',
                            action: {
                                type: 'SELECT_DEALER_CARD',
                                playerId: cardHostId,
                                cardId: dealerCards[0].id
                            }
                        };
                        
                        console.log('📤 Sending card selection:', JSON.stringify(selectMessage, null, 2));
                        hostWs.send(JSON.stringify(selectMessage));
                    }, 1000);
                } else if (message.gameState.stage === 'dealer-selection') {
                    console.log('🎯 Not CardHost turn. Current:', message.gameState.dealerSelection.currentSelectingPlayerId);
                    console.log('🎯 CardHost ID:', cardHostId);
                }
            }
        }
        
        if (message.type === 'action_result') {
            console.log('📋 Action result:', message);
        }
        
        if (message.type === 'error') {
            console.log('❌ Error:', message);
        }
    });
    
    // Change name
    hostWs.send(JSON.stringify({
        type: 'change_name',
        newName: 'CardHost'
    }));
    
    await sleep(100);
    
    // Create room
    hostWs.send(JSON.stringify({
        type: 'create_room',
        playerName: 'CardHost',
        roomName: 'Card Selection Test Room'
    }));
    
    // Wait for test to complete
    await sleep(15000);
    
    console.log('🧪 Test completed. Closing connections...');
    hostWs.close();
    if (clientWs) clientWs.close();
}

async function connectClient() {
    await sleep(1000);
    
    // Connect client
    clientWs = new WebSocket('ws://localhost:3003');
    
    await new Promise(resolve => {
        clientWs.on('open', () => {
            console.log('✅ CardClient connected');
            resolve();
        });
    });
    
    clientWs.on('message', (data) => {
        const message = JSON.parse(data.toString());
        console.log('👤 Client received:', message.type);
        
        if (message.type === 'room_joined' && message.room) {
            cardClientId = message.player ? message.player.id : null;
            console.log('👤 CardClient joined room');
            console.log('🚀 Starting game...');
            
            // Start the game
            setTimeout(() => {
                hostWs.send(JSON.stringify({
                    type: 'start_game'
                }));
            }, 500);
        }
    });
    
    // Change name
    clientWs.send(JSON.stringify({
        type: 'change_name',
        newName: 'CardClient'
    }));
    
    await sleep(500);
    
    // Join room
    if (roomId) {
        console.log('👤 Joining room:', roomId);
        clientWs.send(JSON.stringify({
            type: 'join_room',
            playerName: 'CardClient',
            roomId: roomId
        }));
    }
}

testCardSelection().catch(console.error);
