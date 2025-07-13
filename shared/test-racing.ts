// Test file to isolate the TypeScript compilation issue

export type Lane = 1 | 2 | 3 | 4;
export type TrackPosition = number;

export interface Coordinates {
  x: number;
  y: number;
}

export interface DiceRoll {
  playerId: string;
  diceType: 'standard' | 'lane-change';
  result: any;
  timestamp: number;
}

export interface MovementResult {
  success: boolean;
  newPosition: TrackPosition | 'pit' | 'pit-lane';
  newLane: Lane;
  newCoordinates: Coordinates;
}

export interface RacingState {
  currentRacingPlayer: string;
  raceFinished: boolean;
  finishingOrder: string[];
  lapTarget: number;
  pendingMovement?: {
    playerId: string;
    diceRoll: DiceRoll;
    movementResult: MovementResult;
    confirmed: boolean;
  };
  pitPositions?: Map<string, number>;
}
