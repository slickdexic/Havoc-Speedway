// Game Constants

import { Suit, Rank } from '../types/cards.js';
import { CoinValue } from '../types/racing.js';
import { PlayerColor } from '../types/game.js';

// Card game constants
export const SUITS: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs'];
export const RANKS: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Single deck: 32 cards (8 ranks × 4 suits)
export const SINGLE_DECK_SIZE = 32;
export const DOUBLE_DECK_SIZE = 64;

// Dealer selection: 18 cards in 3x6 grid
export const DEALER_SELECTION_CARDS = 18;
export const DEALER_SELECTION_ROWS = 3;
export const DEALER_SELECTION_COLS = 6;

// Track constants
export const TRACK_POSITIONS = 96;
export const LANES = 4;
export const PIT_POSITIONS = 4;
export const PIT_LANE_POSITIONS = 5;

// Track segments (based on V07 specification)
export const TRACK_SEGMENTS = {
  RIGHT_STRAIGHT: { start: 96, end: 5 }, // positions 96, 1-5
  FIRST_CORNER: { start: 6, end: 19 },
  TOP_STRAIGHT: { start: 20, end: 29 },
  SECOND_CORNER: { start: 30, end: 43 },
  LEFT_STRAIGHT: { start: 44, end: 53 },
  THIRD_CORNER: { start: 54, end: 67 },
  BOTTOM_STRAIGHT: { start: 68, end: 77 },
  FOURTH_CORNER: { start: 78, end: 91 },
  FINAL_STRAIGHT: { start: 92, end: 96 }
} as const;

// Lane spacing and coordinates (from TrackCoordinates.csv)
export const LANE_SPACING = 1.0;
export const START_FINISH_LINE = { x: 14.4174, y: 0.0 };

// Lane distances and radii
export const LANE_STRUCTURE = {
  1: { straightDistance: 14.4174, cornerRadius: 9.4174 },
  2: { straightDistance: 15.4174, cornerRadius: 10.4174 },
  3: { straightDistance: 16.4174, cornerRadius: 11.4174 },
  4: { straightDistance: 17.4174, cornerRadius: 12.4174 }
} as const;

// Pit coordinates
export const PIT_COORDINATES = [
  { x: 12.0, y: 0.7 }, // Pit Position 1
  { x: 12.0, y: 1.9 }, // Pit Position 2
  { x: 12.0, y: 3.1 }, // Pit Position 3
  { x: 12.0, y: 4.3 }  // Pit Position 4
];

// Pit-lane coordinates
export const PIT_LANE_COORDINATES = [
  { x: 13.4174, y: 0.5 }, // Adjacent to Lane 1 Position 1
  { x: 13.4174, y: 1.5 }, // Adjacent to Lane 1 Position 2
  { x: 13.4174, y: 2.5 }, // Adjacent to Lane 1 Position 3
  { x: 13.4174, y: 3.5 }, // Adjacent to Lane 1 Position 4
  { x: 13.4174, y: 4.5 }  // Adjacent to Lane 1 Position 5
];

// Coin system constants
export const COIN_DISTRIBUTION: Record<CoinValue, number> = {
  '+2': 16,
  '+3': 12,
  '+4': 8,
  '+5': 6,
  '-2': 16,
  '-3': 12,
  '-4': 8,
  '-5': 6,
  'tow-to-pit': 6
};

export const TOTAL_COINS = 90;

// Player colors
export const PLAYER_COLORS: PlayerColor[] = [
  'yellow',
  'orange', 
  'red',
  'pink',
  'purple',
  'blue',
  'green',
  'black'
];

// Game limits
export const MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;

// Timing constants (milliseconds)
export const ANIMATION_TIMINGS = {
  CARD_FLIP: 500,
  CARD_MOVEMENT: 500,
  DEALER_BUTTON_DROP: 1000,
  STAGE_TRANSITION: 1000,
  CARD_DEAL_PER_CARD: 300,
  CARD_PLAY: 400,
  PAWN_MOVEMENT_PER_SPACE: 200
} as const;

// Game configuration ranges
export const GAME_CONFIG_RANGES = {
  LAPS: [1, 2, 3, 4, 5] as const,
  DICE: [1, 2] as const,
  DECKS: [1, 2] as const,
  CARDS_PER_HAND: [3, 4, 5] as const,
  COINS: [1, 2, 3] as const
} as const;
