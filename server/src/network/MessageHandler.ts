// Message Handler - WebSocket communication management

import { WebSocket } from 'ws';
import { GameServer } from '../game/GameServer.js';
import { Player } from '@havoc-speedway/shared';
import { v4 as uuidv4 } from 'uuid';

interface ClientConnection {
  ws: WebSocket;
  playerId?: string;
  roomId?: string;
}

export class MessageHandler {
  private connections: Map<WebSocket, ClientConnection> = new Map();
  private gameServer: GameServer;

  constructor(gameServer: GameServer) {
    this.gameServer = gameServer;
  }

  handleConnection(ws: WebSocket): void {
    const connection: ClientConnection = { ws };
    this.connections.set(ws, connection);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('❌ Invalid JSON message:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    console.log('🔌 Client connection established');
  }

  handleDisconnection(ws: WebSocket): void {
    const connection = this.connections.get(ws);
    if (connection?.playerId && connection?.roomId) {
      this.gameServer.leaveRoom(connection.roomId, connection.playerId);
      this.broadcastToRoom(connection.roomId, {
        type: 'player-left',
        playerId: connection.playerId
      });
    }

    this.connections.delete(ws);
    console.log('🔌 Client disconnected');
  }

  private handleMessage(ws: WebSocket, message: any): void {
    const connection = this.connections.get(ws);
    if (!connection) return;

    console.log('📨 Message received:', message.type);

    switch (message.type) {
      case 'create_room':
        this.handleCreateRoom(ws, message);
        break;
      
      case 'join_room':
        this.handleJoinRoom(ws, message);
        break;
      
      case 'join_room_code':
        this.handleJoinRoomCode(ws, message);
        break;
      
      case 'list_rooms':
        this.handleGetRooms(ws);
        break;
      
      case 'get_rooms':
        this.handleGetRooms(ws);
        break;
      
      case 'start_game':
        this.handleStartGame(ws, message);
        break;
      
      case 'player_action':
        this.handlePlayerAction(ws, message);
        break;
      
      case 'leave_room':
        this.handleLeaveRoom(ws);
        break;
      
      default:
        console.log('❓ Unknown message type:', message.type);
        this.sendError(ws, 'Unknown message type');
    }
  }

  private handleCreateRoom(ws: WebSocket, message: any): void {
    const { playerName, roomName } = message;
    
    // Create default game settings
    const settings = {
      numberOfLaps: 2 as 1 | 2 | 3 | 4 | 5,
      numberOfDice: 1 as 1 | 2,
      numberOfDecks: 1 as 1 | 2,
      cardsPerHand: 5 as 3 | 4 | 5,
      numberOfCoins: 2 as 1 | 2 | 3
    };
    
    const player: Player = {
      id: uuidv4(),
      name: playerName,
      color: ['red', 'blue', 'green', 'yellow'][0] as any,
      roomSlot: 1,
      isHost: true,
      isConnected: true
    };

    const roomId = this.gameServer.createRoom(player, roomName, settings);
    
    const connection = this.connections.get(ws);
    if (connection) {
      connection.playerId = player.id;
      connection.roomId = roomId;
    }

    // Send room created confirmation and join the player to the room
    this.send(ws, {
      type: 'room_created',
      roomId: roomId
    });
    
    // Immediately send joined room state
    const gameState = this.gameServer.getGameState(roomId);
    const serializedGameState = this.serializeGameState(gameState);
    
    this.send(ws, {
      type: 'joined_room',
      roomId: roomId,
      gameState: serializedGameState
    });
  }

  private handleJoinRoom(ws: WebSocket, message: any): void {
    const { playerName, roomId } = message;
    
    const player: Player = {
      id: uuidv4(),
      name: playerName,
      color: ['red', 'green', 'yellow', 'purple'][Math.floor(Math.random() * 4)] as any,
      roomSlot: 2, // Will be assigned by game server
      isHost: false,
      isConnected: true
    };

    const success = this.gameServer.joinRoom(roomId, player);
    
    if (success) {
      const connection = this.connections.get(ws);
      if (connection) {
        connection.playerId = player.id;
        connection.roomId = roomId;
      }

      // Send game state to the joining player
      this.send(ws, {
        type: 'game_state_update',
        gameState: this.serializeGameState(this.gameServer.getGameState(roomId))
      });

      // Notify all players in the room about the new player
      this.broadcastToRoom(roomId, {
        type: 'game_state_update',
        gameState: this.serializeGameState(this.gameServer.getGameState(roomId))
      });
    } else {
      this.sendError(ws, 'Failed to join room - room may be full or not found');
    }
  }

  private handleJoinRoomCode(ws: WebSocket, message: any): void {
    const { playerName, roomCode } = message;
    
    // Find room by code (first 6 characters of room ID)
    const rooms = this.gameServer.getAllRooms();
    const room = rooms.find(r => r.id.substring(0, 6).toUpperCase() === roomCode.toUpperCase());
    
    if (!room) {
      this.sendError(ws, 'Room not found - check the room code');
      return;
    }
    
    // Use the regular join room logic
    this.handleJoinRoom(ws, { playerName, roomId: room.id });
  }

  private handleGetRooms(ws: WebSocket): void {
    const rooms = this.gameServer.getAllRooms();
    
    // Transform rooms to include codes and match client expectations
    const roomsData = rooms.map(room => ({
      id: room.id,
      name: room.name,
      playerCount: room.players.size,
      maxPlayers: 4,
      stage: room.status === 'waiting' ? 'waiting' : room.currentStage,
      isPublic: true, // TODO: Add isPublic to Room interface
      code: room.id.substring(0, 6).toUpperCase() // Generate readable room code
    }));
    
    this.send(ws, {
      type: 'rooms_list',
      rooms: roomsData
    });
  }

  private handleStartGame(ws: WebSocket, message: any): void {
    const connection = this.connections.get(ws);
    if (!connection?.roomId) {
      this.sendError(ws, 'Not in a room');
      return;
    }

    const success = this.gameServer.startGame(connection.roomId);
    if (success) {
      this.broadcastToRoom(connection.roomId, {
        type: 'game_state_update',
        gameState: this.serializeGameState(this.gameServer.getGameState(connection.roomId))
      });
    } else {
      this.sendError(ws, 'Failed to start game');
    }
  }

  private handlePlayerAction(ws: WebSocket, message: any): void {
    const connection = this.connections.get(ws);
    if (!connection?.roomId || !connection?.playerId) {
      this.sendError(ws, 'Not in a room');
      return;
    }

    const success = this.gameServer.handlePlayerAction(
      connection.roomId, 
      connection.playerId, 
      message.action
    );

    if (success) {
      this.broadcastToRoom(connection.roomId, {
        type: 'game-updated',
        gameState: this.gameServer.getGameState(connection.roomId)
      });
    } else {
      this.sendError(ws, 'Invalid action');
    }
  }

  private handleAddTestPlayer(ws: WebSocket, message: any): void {
    const connection = this.connections.get(ws);
    if (!connection?.roomId) {
      this.sendError(ws, 'Not in a room');
      return;
    }

    const { playerName } = message;
    
    const player: Player = {
      id: uuidv4(),
      name: playerName,
      color: ['red', 'green', 'yellow'][Math.floor(Math.random() * 3)] as any,
      roomSlot: 2, // Will be assigned by game server
      isHost: false,
      isConnected: true
    };

    const success = this.gameServer.joinRoom(connection.roomId, player);
    
    if (success) {
      this.broadcastToRoom(connection.roomId, {
        type: 'game_state_update',
        gameState: this.serializeGameState(this.gameServer.getGameState(connection.roomId))
      });
    } else {
      this.sendError(ws, 'Failed to add test player');
    }
  }

  private handleLeaveRoom(ws: WebSocket) {
    const connection = this.connections.get(ws);
    if (!connection?.playerId || !connection?.roomId) {
      this.sendError(ws, 'Not in a room');
      return;
    }

    const success = this.gameServer.leaveRoom(connection.roomId, connection.playerId);
    if (success) {
      // Broadcast updated game state to remaining players in the room
      this.broadcastToRoom(connection.roomId, {
        type: 'game_state',
        gameState: this.serializeGameState(this.gameServer.getGameState(connection.roomId))
      });
      
      // Clear connection's room association
      connection.roomId = undefined;
      
      ws.send(JSON.stringify({
        type: 'left_room',
        success: true
      }));
    } else {
      this.sendError(ws, 'Failed to leave room');
    }
  }

  /**
   * Serialize game state for JSON transmission
   * Converts Map objects to regular objects that can be sent over JSON
   * Also transforms the structure to match client expectations
   */
  private serializeGameState(gameState: any): any {
    if (!gameState) return null;
    
    // Convert players Map to array for client compatibility
    const players = Array.from(gameState.room.players.values());
    
    return {
      stage: gameState.stage,
      roomId: gameState.room.id,
      roomName: gameState.room.name,
      players: players,
      currentPlayerIndex: gameState.currentPlayerIndex,
      dealerIndex: gameState.dealerIndex,
      dealerCards: gameState.dealerCards,
      message: gameState.message
    };
  }

  private send(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string): void {
    this.send(ws, {
      type: 'error',
      error
    });
  }

  private broadcastToRoom(roomId: string, message: any, exclude?: WebSocket): void {
    for (const [ws, connection] of this.connections) {
      if (connection.roomId === roomId && ws !== exclude) {
        this.send(ws, message);
      }
    }
  }
}
