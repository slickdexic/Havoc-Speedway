// Player Action Types

import { Lane, TrackPosition } from './racing.js';
import { Suit } from './cards.js';

export type PlayerAction =
  | SelectDealerCardAction
  | PlayCardAction
  | DrawCardsAction
  | SelectLaneAction
  | PlaceCoinAction
  | RollDiceAction
  | ConfirmMovementAction;

export interface SelectDealerCardAction {
  type: 'SELECT_DEALER_CARD';
  cardId: string;
}

export interface PlayCardAction {
  type: 'PLAY_CARD';
  cardId: string;
  calledSuit?: Suit;
}

export interface DrawCardsAction {
  type: 'DRAW_CARDS';
}

export interface SelectLaneAction {
  type: 'SELECT_LANE';
  lane: Lane;
}

export interface PlaceCoinAction {
  type: 'PLACE_COIN';
  position: {
    position: TrackPosition;
    lane: Lane;
  };
}

export interface RollDiceAction {
  type: 'ROLL_DICE';
  diceType: 'standard' | 'lane-change';
}

export interface ConfirmMovementAction {
  type: 'CONFIRM_MOVEMENT';
}
