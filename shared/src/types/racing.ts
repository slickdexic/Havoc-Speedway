// Track and Racing Types

export interface Coordinates {
  x: number;
  y: number;
}

export type Lane = 1 | 2 | 3 | 4;
export type TrackPosition = number; // 1-96

export interface TrackPositionData {
  position: TrackPosition;
  lane: Lane;
  coordinates: Coordinates;
  segmentType: 'straight' | 'corner';
  segmentName: 'right-straight' | 'first-corner' | 'top-straight' | 'second-corner' | 
                'left-straight' | 'third-corner' | 'bottom-straight' | 'fourth-corner' | 'final-straight';
}

export interface PitPosition {
  pitNumber: 1 | 2 | 3 | 4;
  coordinates: Coordinates;
}

export interface PitLanePosition {
  pitLaneNumber: 1 | 2 | 3 | 4 | 5;
  coordinates: Coordinates;
  adjacentTrackPosition: TrackPosition; // which main track position it's adjacent to
}

// Pawn (player car) state
export interface PawnState {
  playerId: string;
  currentPosition: TrackPosition | 'pit' | 'pit-lane';
  lane: Lane;
  lapNumber: number;
  coordinates: Coordinates;
  pitPosition?: number; // 1-4 for pit, 1-5 for pit-lane
}

// Coin system
export type CoinValue = '+2' | '+3' | '+4' | '+5' | '-2' | '-3' | '-4' | '-5' | 'tow-to-pit';

export interface Coin {
  id: string;
  value: CoinValue;
  ownerId: string; // player who placed it
  position: TrackPosition;
  lane: Lane;
  coordinates: Coordinates;
  isRevealed: boolean; // true when triggered
}

// Dice system
export type StandardDieResult = 1 | 2 | 3 | 4 | 5 | 6;
export type LaneChangeDieResult = 'L1' | 'R1' | 'check-engine' | 'L2' | 'R2';

export interface DiceRoll {
  playerId: string;
  diceType: 'standard' | 'lane-change';
  result: StandardDieResult | StandardDieResult[] | LaneChangeDieResult; // array for 2-dice games
  timestamp: number;
}

// Movement and racing state
export interface MovementResult {
  success: boolean;
  newPosition: TrackPosition | 'pit' | 'pit-lane';
  newLane: Lane;
  newCoordinates: Coordinates;
  coinsTriggered: Coin[];
  lapCompleted: boolean;
  raceFinished: boolean;
  obstruction?: {
    blockedBy: 'wall' | 'pawn';
    finalPosition: TrackPosition | 'pit' | 'pit-lane';
  };
}

export interface RacingState {
  pawns: Map<string, PawnState>;
  coins: Map<string, Coin>; // keyed by coin.id
  currentRacingPlayer: string;
  raceFinished: boolean;
  finishingOrder: string[]; // playerIds in finishing order
  lapTarget: number; // configured by host (1-5)
}
