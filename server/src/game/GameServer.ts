// Game Server - Main game management class

import { 
  Room, 
  Player, 
  GameState, 
  GameStage, 
  GameSettings 
} from '@havoc-speedway/shared';
import { v4 as uuidv4 } from 'uuid';
import { RoomManager } from './RoomManager.js';
import { StageManager } from './stages/StageManager.js';

export class GameServer {
  private roomManager: RoomManager;
  private stageManager: StageManager;
  private rooms: Map<string, GameState> = new Map();

  constructor() {
    this.roomManager = new RoomManager();
    this.stageManager = new StageManager();
    
    console.log('🎮 GameServer initialized');
  }

  // Room management
  createRoom(hostPlayer: Player, roomName: string, settings: GameSettings): string {
    const roomId = uuidv4();
    
    const room: Room = {
      id: roomId,
      name: roomName,
      hostId: hostPlayer.id,
      players: new Map([[hostPlayer.id, { ...hostPlayer, roomSlot: 1, isHost: true }]]),
      settings,
      status: 'waiting',
      currentStage: 'dealer-selection',
      createdAt: Date.now()
    };

    const gameState: GameState = {
      room,
      stage: 'dealer-selection',
      stormWinningOrder: [],
      dealerButton: '',
      roundNumber: 0,
      lastUpdate: Date.now(),
      stageStartTime: Date.now()
    };

    this.rooms.set(roomId, gameState);
    
    console.log(`🏠 Room created: ${roomName} (${roomId}) by ${hostPlayer.name}`);
    return roomId;
  }

  joinRoom(roomId: string, player: Player): boolean {
    const gameState = this.rooms.get(roomId);
    if (!gameState) {
      console.log(`❌ Room not found: ${roomId}`);
      return false;
    }

    if (gameState.room.players.size >= 4) {
      console.log(`❌ Room full: ${roomId}`);
      return false;
    }

    if (gameState.room.status !== 'waiting') {
      console.log(`❌ Room not accepting players: ${roomId}`);
      return false;
    }

    // Assign next available slot
    const usedSlots = Array.from(gameState.room.players.values()).map(p => p.roomSlot);
    const availableSlot = [2, 3, 4].find(slot => !usedSlots.includes(slot as any)) as 1 | 2 | 3 | 4;
    
    if (!availableSlot) {
      console.log(`❌ No available slots in room: ${roomId}`);
      return false;
    }

    const playerInRoom: Player = {
      ...player,
      roomSlot: availableSlot,
      isHost: false
    };

    gameState.room.players.set(player.id, playerInRoom);
    gameState.lastUpdate = Date.now();
    
    console.log(`👤 Player joined: ${player.name} -> ${gameState.room.name} (slot ${availableSlot})`);
    return true;
  }

  leaveRoom(roomId: string, playerId: string): boolean {
    const gameState = this.rooms.get(roomId);
    if (!gameState) return false;

    const removed = gameState.room.players.delete(playerId);
    if (removed) {
      gameState.lastUpdate = Date.now();
      
      // If host left and there are other players, assign new host
      if (gameState.room.hostId === playerId && gameState.room.players.size > 0) {
        const newHost = Array.from(gameState.room.players.values())[0];
        newHost.isHost = true;
        gameState.room.hostId = newHost.id;
        console.log(`👑 New host assigned: ${newHost.name}`);
      }

      // If room is empty, remove it
      if (gameState.room.players.size === 0) {
        this.rooms.delete(roomId);
        console.log(`🗑️ Empty room removed: ${roomId}`);
      }

      console.log(`👋 Player left room: ${playerId}`);
    }

    return removed;
  }

  // Game state access
  getGameState(roomId: string): GameState | undefined {
    return this.rooms.get(roomId);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values()).map(gameState => gameState.room);
  }

  // Game flow management
  startGame(roomId: string): boolean {
    const gameState = this.rooms.get(roomId);
    if (!gameState) return false;

    if (gameState.room.players.size < 2) {
      console.log(`❌ Not enough players to start game: ${roomId}`);
      return false;
    }

    gameState.room.status = 'in-progress';
    gameState.stage = 'dealer-selection';
    gameState.stageStartTime = Date.now();
    gameState.lastUpdate = Date.now();

    // Initialize dealer selection
    this.stageManager.initializeDealerSelection(gameState);

    console.log(`🚀 Game started in room: ${gameState.room.name}`);
    return true;
  }

  // Stage transitions
  advanceStage(roomId: string): boolean {
    const gameState = this.rooms.get(roomId);
    if (!gameState) return false;

    return this.stageManager.advanceStage(gameState);
  }

  // Player actions
  handlePlayerAction(roomId: string, playerId: string, action: any): boolean {
    const gameState = this.rooms.get(roomId);
    if (!gameState) return false;

    return this.stageManager.handlePlayerAction(gameState, playerId, action);
  }
}
