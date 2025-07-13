// Game Flow and State Management Types

import { Card, StormGameState, DealerSelectionState } from './cards';
import { Lane, Coin, RacingState } from './racing';

export type GameStage = 
  | 'dealer-selection'
  | 'storm'
  | 'lane-selection' 
  | 'coin'
  | 'racing';

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  roomSlot: 1 | 2 | 3 | 4; // host always slot 1
  isHost: boolean;
  isConnected: boolean;
}

export type PlayerColor = 
  | 'yellow'
  | 'orange' 
  | 'red'
  | 'pink'
  | 'purple'
  | 'blue'
  | 'green'
  | 'black';

// Game configuration (set by host)
export interface GameSettings {
  numberOfLaps: 1 | 2 | 3 | 4 | 5;
  numberOfDice: 1 | 2; // for movement dice
  numberOfDecks: 1 | 2;
  cardsPerHand: 3 | 4 | 5;
  numberOfCoins: 1 | 2 | 3; // awarded to 1st place
}

// Room and lobby state
export interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Map<string, Player>;
  settings: GameSettings;
  status: 'waiting' | 'in-progress' | 'finished';
  currentStage: GameStage;
  createdAt: number;
}

// Lane selection state
export interface LaneSelectionState {
  availableLanes: Lane[]; // lanes still available for selection
  selectedLanes: Map<string, Lane>; // playerId -> selected lane
  currentSelector: string; // based on Storm finishing order
  allLanesSelected: boolean;
}

// Coin stage state
export interface CoinStageState {
  coinDistribution: Map<string, number>; // playerId -> number of coins awarded
  drawnCoins: Map<string, Coin[]>; // playerId -> coins drawn from purse
  placedCoins: Coin[]; // coins placed on track
  currentPlacer: string; // whose turn to place coins
  allCoinsPlaced: boolean;
}

// Complete game state
export interface GameState {
  room: Room;
  stage: GameStage;
  
  // Stage-specific states
  dealerSelection?: DealerSelectionState;
  storm?: StormGameState;
  laneSelection?: LaneSelectionState;
  coinStage?: CoinStageState;
  racing?: RacingState;
  
  // Cross-stage data
  stormWinningOrder: string[]; // playerIds in Storm finishing order, used for subsequent turn order
  dealerButton: string; // current dealer playerId
  roundNumber: number; // increments after each racing stage
  
  // Timestamps
  lastUpdate: number;
  stageStartTime: number;
}
