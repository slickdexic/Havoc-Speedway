const WebSocket = require('ws');

async function testDealerSelectionUI() {
    console.log('🧪 Testing dealer selection UI...');
    
    const hostWs = new WebSocket('ws://localhost:3003');
    const clientWs = new WebSocket('ws://localhost:3003');
    
    let hostId, clientId, roomId;
    
    // Host setup
    hostWs.on('open', () => {
        console.log('🏠 Host connected');
        hostWs.send(JSON.stringify({ type: 'change_name', newName: 'TestHost' }));
        
        setTimeout(() => {
            hostWs.send(JSON.stringify({
                type: 'create_room',
                playerName: 'TestHost',
                roomName: 'UI Test Room'
            }));
        }, 100);
    });
    
    hostWs.on('message', (data) => {
        const message = JSON.parse(data.toString());
        console.log('🏠 Host received:', message.type);
        
        if (message.type === 'room_joined') {
            roomId = message.room.id;
            const hostPlayer = message.room.players.find(p => p.name === 'TestHost');
            if (hostPlayer) {
                hostId = hostPlayer.id;
                console.log('🏠 Host ID:', hostId);
            }
        }
        
        if (message.type === 'game_started' || message.type === 'game_state_update') {
            if (message.gameState?.dealerSelection?.dealerCards) {
                console.log('🎴 Dealer cards:', message.gameState.dealerSelection.dealerCards.length);
                console.log('🎴 Current selecting:', message.gameState.dealerSelection.currentSelectingPlayerId);
                console.log('🎴 Host ID:', hostId);
                console.log('🎴 Is host turn?:', message.gameState.dealerSelection.currentSelectingPlayerId === hostId);
            }
        }
    });
    
    // Client setup
    clientWs.on('open', () => {
        console.log('👤 Client connected');
        clientWs.send(JSON.stringify({ type: 'change_name', newName: 'TestClient' }));
        
        setTimeout(() => {
            if (roomId) {
                clientWs.send(JSON.stringify({
                    type: 'join_room',
                    playerName: 'TestClient',
                    roomId: roomId
                }));
            }
        }, 2000);
    });
    
    clientWs.on('message', (data) => {
        const message = JSON.parse(data.toString());
        console.log('👤 Client received:', message.type);
        
        if (message.type === 'room_joined') {
            console.log('👤 Client joined, starting game...');
            setTimeout(() => {
                hostWs.send(JSON.stringify({ type: 'start_game' }));
            }, 500);
        }
    });
    
    // Keep test running
    setTimeout(() => {
        console.log('🧪 Test complete, closing connections...');
        hostWs.close();
        clientWs.close();
    }, 30000);
}

testDealerSelectionUI().catch(console.error);
