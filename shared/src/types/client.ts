// Types for client-side state, matching the serialized data from the server.

import { Card } from './cards';
import { 
    Lane, 
    Coin, 
    PawnState, 
    DiceRoll, 
    MovementResult 
} from './racing';
import { 
    Player, 
    GameSettings, 
    GameStage 
} from './game';

export interface ClientDealerSelectionState {
    dealerCards: Card[];
    selectedCards: { [playerId: string]: Card };
    currentSelectingPlayerId: string;
    dealerId?: string;
    isComplete: boolean;
    tieBreakerPlayers: string[];
}

export interface ClientStormState {
    playerHands: { [playerId: string]: { cards: Card[]; cardCount: number } };
    discardPile: Card[];
    currentPlayerId: string;
    toxicSevenActive: boolean;
    toxicDrawAmount: number;
    calledSuit?: 'hearts' | 'diamonds' | 'spades' | 'clubs';
    finishingOrder: string[];
    isComplete: boolean;
}

export interface ClientLaneSelectionState {
    availableLanes: Lane[];
    selectedLanes: { [playerId: string]: Lane };
    currentSelector: string;
    allLanesSelected: boolean;
}

export interface ClientCoinStageState {
    coinDistribution: { [playerId: string]: number };
    drawnCoins: { [playerId: string]: Coin[] };
    placedCoins: Coin[];
    currentPlacer: string;
    allCoinsPlaced: boolean;
}

export interface ClientRacingState {
    pawns: { [playerId: string]: PawnState };
    coins: { [coinId: string]: Coin };
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
}

export interface ClientGameState {
    stage: GameStage;
    roomId: string;
    roomName: string;
    players: Player[];
    roundNumber: number;
    dealerButton?: string;
    stormWinningOrder: string[];
    settings: GameSettings;
    message?: string;
    
    // Stage-specific states
    dealerSelection?: ClientDealerSelectionState;
    storm?: ClientStormState;
    laneSelection?: ClientLaneSelectionState;
    coinStage?: ClientCoinStageState;
    racing?: ClientRacingState;
}
