// Card Game Types (Storm Rules)

export type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';
export type Rank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // unique identifier for tracking
  isFlipped?: boolean; // for dealer selection cards
  position?: { x: number; y: number }; // for animations
}

export interface CardDeck {
  cards: Card[];
  isDoubleDeck: boolean;
}

// Dealer selection state
export interface DealerSelectionState {
  dealerCards: Card[]; // 18 face-down cards in 3x6 grid
  selectedCards: Map<string, Card>; // playerId -> selected card
  currentSelectingPlayerId: string;
  dealerId?: string;
  isComplete: boolean;
}

// Special card effects
export type SpecialCardType = 'ace' | 'queen' | 'seven';

export interface SpecialCardEffect {
  type: SpecialCardType;
  skipNextPlayer?: boolean; // for Aces
  wildCard?: boolean; // for Queens
  calledSuit?: Suit; // for Queens
  toxicDraw?: number; // for Sevens (2, 4, 6, 8...)
}

// Player hand and card game state
export interface PlayerHand {
  playerId: string;
  cards: Card[];
  cardCount: number;
}

export interface StormGameState {
  currentPlayerId: string;
  discardPile: Card[];
  stockPile: Card[];
  playerHands: Map<string, PlayerHand>;
  toxicSevenActive: boolean;
  toxicDrawAmount: number;
  calledSuit?: Suit; // when Queen is played
  finishingOrder: string[]; // playerIds in finishing order (1st, 2nd, 3rd, 4th)
  isComplete: boolean;
}

// Card game actions
export type CardAction = 
  | { type: 'SELECT_DEALER_CARD'; playerId: string; cardId: string }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string; calledSuit?: Suit }
  | { type: 'DRAW_CARDS'; playerId: string; count: number }
  | { type: 'CALL_SUIT'; playerId: string; suit: Suit };
