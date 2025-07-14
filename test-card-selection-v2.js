const WebSocket = require('ws');

const ws1 = new WebSocket('ws://localhost:3003');
const ws2 = new WebSocket('ws://localhost:3003');

let cardHostId;
let roomId;
let dealerCards = [];

// Host connection
ws1.on('open', () => {
    console.log('CardHost connected');
    
    // Change name to CardHost
    ws1.send(JSON.stringify({
        type: 'change_name',
        newName: 'CardHost'
    }));
    
    // Create room
    setTimeout(() => {
        ws1.send(JSON.stringify({
            type: 'create_room',
            playerName: 'CardHost',
            roomName: 'Card Selection Test Room'
        }));
    }, 100);
});

ws1.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('CardHost received:', message.type);
    
    if (message.type === 'room_created') {
        roomId = message.roomId;
        console.log('Room created:', roomId);
    }
    
    if (message.type === 'game_state_update') {
        console.log('Game state:', JSON.stringify(message.gameState, null, 2));
        
        // Store dealer cards for later use
        if (message.gameState.dealerSelection && message.gameState.dealerSelection.dealerCards) {
            dealerCards = message.gameState.dealerSelection.dealerCards;
            console.log('Dealer cards available:', dealerCards.length);
            console.log('First few card IDs:', dealerCards.slice(0, 3).map(c => c.id));
        }
        
        // If we're in dealer selection and it's CardHost's turn
        if (message.gameState.stage === 'dealer-selection' && 
            message.gameState.dealerSelection.currentSelectingPlayerId === cardHostId &&
            dealerCards.length > 0) {
            
            console.log('CardHost turn! Selecting a card...');
            
            // Try to select the first card using its actual ID
            setTimeout(() => {
                const selectMessage = {
                    type: 'player_action',
                    action: {
                        type: 'SELECT_DEALER_CARD',
                        playerId: cardHostId, // Use the actual UUID
                        cardId: dealerCards[0].id // Use the first card's actual ID
                    }
                };
                
                console.log('Sending:', JSON.stringify(selectMessage, null, 2));
                ws1.send(JSON.stringify(selectMessage));
            }, 500);
        }
    }
    
    if (message.type === 'player_joined') {
        if (message.player.name === 'CardHost') {
            cardHostId = message.player.id;
            console.log('CardHost ID:', cardHostId);
        }
    }
});

// Client connection  
ws2.on('open', () => {
    console.log('CardClient connected');
    
    // Change name to CardClient
    ws2.send(JSON.stringify({
        type: 'change_name',
        newName: 'CardClient'
    }));
    
    // Wait a bit then join room
    setTimeout(() => {
        if (roomId) {
            ws2.send(JSON.stringify({
                type: 'join_room',
                playerName: 'CardClient',
                roomId: roomId
            }));
        }
    }, 1000);
});

ws2.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('CardClient received:', message.type);
    
    if (message.type === 'player_joined' && message.player.name === 'CardClient') {
        console.log('CardClient joined, starting game...');
        
        // Start the game
        setTimeout(() => {
            ws1.send(JSON.stringify({
                type: 'start_game'
            }));
        }, 500);
    }
});

ws1.on('error', (error) => {
    console.error('CardHost WebSocket error:', error);
});

ws2.on('error', (error) => {
    console.error('CardClient WebSocket error:', error);
});

// Close connections after test
setTimeout(() => {
    console.log('Closing connections...');
    ws1.close();
    ws2.close();
}, 10000);
