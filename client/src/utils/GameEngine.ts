// =================== MODERN GAME ARCHITECTURE ===================
// Professional game state management and business logic layer

import { Player, GameStage } from '../../../shared/src/types/game';
import { Card } from '../../../shared/src/types/cards';
import { ClientGameState, ClientDealerSelectionState } from '../../../shared/src/types/client';

/**
 * Professional Game Engine - Centralized business logic
 * Implements comprehensive game state management with proper separation of concerns
 */
export class GameEngine {
  private gameState: ClientGameState;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor(gameState: ClientGameState) {
    this.gameState = gameState;
  }

  /**
   * Modern event system for game state changes
   */
  public addEventListener(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public removeEventListener(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Professional player management
   */
  public getPlayer(playerId: string): Player | undefined {
    return this.gameState.players.find((p: Player) => p.id === playerId);
  }

  public getCurrentPlayer(): Player | undefined {
    if (!this.gameState.dealerSelection) return undefined;
    return this.getPlayer(this.gameState.dealerSelection.currentSelectingPlayerId);
  }

  public getPlayersInOrder(): Player[] {
    return [...this.gameState.players].sort((a: Player, b: Player) => a.roomSlot - b.roomSlot);
  }

  public isPlayerTurn(playerId: string): boolean {
    if (!this.gameState.dealerSelection) return false;
    return this.gameState.dealerSelection.currentSelectingPlayerId === playerId;
  }

  /**
   * Modern card selection logic for dealer selection
   */
  public canSelectCard(playerId: string, cardId: string): {
    canSelect: boolean;
    reason?: string;
  } {
    if (this.gameState.stage !== 'dealer-selection') {
      return { canSelect: false, reason: 'Not in dealer selection stage' };
    }

    if (!this.gameState.dealerSelection) {
      return { canSelect: false, reason: 'Dealer selection state not initialized' };
    }

    if (!this.isPlayerTurn(playerId)) {
      return { canSelect: false, reason: 'Not your turn' };
    }

    const dealerState = this.gameState.dealerSelection;
    const card = dealerState.dealerCards.find((c: Card) => c.id === cardId);
    
    if (!card) {
      return { canSelect: false, reason: 'Card not found' };
    }

    if (card.isFlipped) {
      return { canSelect: false, reason: 'Card already revealed' };
    }

    if (dealerState.selectedCards[playerId]) {
      return { canSelect: false, reason: 'Already selected a card' };
    }

    return { canSelect: true };
  }

  public selectCard(playerId: string, cardId: string): {
    success: boolean;
    error?: string;
    stateChanges?: any;
  } {
    const validation = this.canSelectCard(playerId, cardId);
    if (!validation.canSelect) {
      return { success: false, error: validation.reason };
    }

    try {
      if (!this.gameState.dealerSelection) {
        return { success: false, error: 'Dealer selection state not initialized' };
      }

      const dealerState = this.gameState.dealerSelection;
      
      // Find and reveal the card
      const cardIndex = dealerState.dealerCards.findIndex((c: Card) => c.id === cardId);
      if (cardIndex === -1) {
        return { success: false, error: 'Card not found' };
      }

      const card = dealerState.dealerCards[cardIndex];
      card.isFlipped = true;
      
      // Record player's selection
      dealerState.selectedCards[playerId] = card;

      // Advance to next player
      this.advanceToNextPlayer();

      // Check if dealer selection is complete
      if (this.isDealerSelectionComplete()) {
        this.completeDealerSelection();
      }

      const stateChanges = {
        cardRevealed: { cardId, card },
        playerSelection: { playerId, cardId },
        nextPlayerId: dealerState.currentSelectingPlayerId
      };

      this.emit('cardSelected', stateChanges);

      return { success: true, stateChanges };
    } catch (error) {
      console.error('Error selecting card:', error);
      return { success: false, error: 'Internal error during card selection' };
    }
  }

  /**
   * Professional turn management
   */
  private advanceToNextPlayer(): void {
    if (!this.gameState.dealerSelection) return;
    
    const players = this.getPlayersInOrder();
    const currentIndex = players.findIndex((p: Player) => p.id === this.gameState.dealerSelection!.currentSelectingPlayerId);
    
    if (currentIndex === -1) {
      console.error('Current player not found in turn order');
      return;
    }

    const nextIndex = (currentIndex + 1) % players.length;
    this.gameState.dealerSelection.currentSelectingPlayerId = players[nextIndex].id;
  }

  /**
   * Professional dealer selection completion logic
   */
  private isDealerSelectionComplete(): boolean {
    if (!this.gameState.dealerSelection) return false;
    const dealerState = this.gameState.dealerSelection;
    return Object.keys(dealerState.selectedCards).length === this.gameState.players.length;
  }

  private completeDealerSelection(): void {
    if (!this.gameState.dealerSelection) return;
    
    const dealerState = this.gameState.dealerSelection;
    
    // Find highest card value to determine dealer
    let highestValue = -1;
    let dealerCandidates: string[] = [];

    for (const [playerId, card] of Object.entries(dealerState.selectedCards)) {
      const cardValue = this.getCardValue(card);
      if (cardValue > highestValue) {
        highestValue = cardValue;
        dealerCandidates = [playerId];
      } else if (cardValue === highestValue) {
        dealerCandidates.push(playerId);
      }
    }

    if (dealerCandidates.length === 1) {
      // Clear winner
      dealerState.dealerId = dealerCandidates[0];
      dealerState.isComplete = true;
      this.gameState.dealerButton = dealerCandidates[0];
      
      this.emit('dealerSelected', { 
        dealerId: dealerCandidates[0],
        winningCard: dealerState.selectedCards[dealerCandidates[0]]
      });
    } else {
      // Tie - start new round with tied players
      this.startTieBreaker(dealerCandidates);
    }
  }

  private getCardValue(card: Card): number {
    // Convert card rank to numeric value for comparison
    const rankValues: Record<string, number> = {
      '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return rankValues[card.rank] || 0;
  }

  private startTieBreaker(tiedPlayers: string[]): void {
    if (!this.gameState.dealerSelection) return;
    
    const dealerState = this.gameState.dealerSelection;
    
    // Reset for tie-breaker round
    dealerState.selectedCards = {};
    dealerState.tieBreakerPlayers = tiedPlayers;
    
    // Set current player to first tied player
    dealerState.currentSelectingPlayerId = tiedPlayers[0];
    
    // Reset cards for new selection
    dealerState.dealerCards.forEach((card: Card) => {
      card.isFlipped = false;
    });

    this.emit('tieBreakerStarted', { tiedPlayers });
  }

  /**
   * Professional game state queries
   */
  public getGameState(): ClientGameState {
    return { ...this.gameState }; // Return copy to prevent mutation
  }

  public getCurrentStage(): GameStage {
    return this.gameState.stage;
  }

  public getDealerSelectionState(): ClientDealerSelectionState | undefined {
    return this.gameState.dealerSelection;
  }

  /**
   * Professional validation and error handling
   */
  public validateGameState(): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate basic structure
    if (!this.gameState.roomId) {
      errors.push('Missing room ID');
    }

    if (!this.gameState.players || this.gameState.players.length === 0) {
      errors.push('No players in game');
    }

    // Stage-specific validation
    switch (this.gameState.stage) {
      case 'dealer-selection':
        errors.push(...this.validateDealerSelectionState());
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateDealerSelectionState(): string[] {
    const errors: string[] = [];
    
    if (!this.gameState.dealerSelection) {
      errors.push('Missing dealer selection state');
      return errors;
    }

    const dealerState = this.gameState.dealerSelection;

    if (!dealerState.dealerCards || dealerState.dealerCards.length !== 18) {
      errors.push('Invalid dealer cards - should be exactly 18');
    }

    if (!dealerState.selectedCards) {
      errors.push('Missing selected cards');
    }

    if (!dealerState.currentSelectingPlayerId) {
      errors.push('Missing current selecting player');
    }

    return errors;
  }

  /**
   * Professional debug and development utilities
   */
  public getDebugInfo(): any {
    return {
      gameState: this.gameState,
      validation: this.validateGameState(),
      playerCount: this.gameState.players.length,
      currentStage: this.gameState.stage,
      currentPlayer: this.getCurrentPlayer()?.name || 'Unknown',
      eventListeners: Array.from(this.eventListeners.keys())
    };
  }
}

/**
 * Professional Game State Factory
 * Creates properly initialized game states for different scenarios
 */
export class GameStateFactory {
  /**
   * Create a new dealer selection game state
   */
  static createDealerSelectionState(players: Player[], roomId: string, roomName: string): ClientGameState {
    // Generate 18 cards with standard deck values
    const suits: Array<'hearts' | 'diamonds' | 'spades' | 'clubs'> = ['hearts', 'diamonds', 'spades', 'clubs'];
    const ranks: Array<'7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'> = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    const availableCards: Card[] = [];
    let cardId = 1;
    
    // Create 18 cards (2+ of each rank, various suits)
    for (let i = 0; i < 18; i++) {
      const suit = suits[i % suits.length];
      const rank = ranks[Math.floor(i / 2.25)]; // Distribute ranks evenly
      availableCards.push({
        id: `dealer-card-${cardId++}`,
        suit,
        rank,
        isFlipped: false
      });
    }

    // Shuffle the cards
    for (let i = availableCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableCards[i], availableCards[j]] = [availableCards[j], availableCards[i]];
    }

    const dealerSelectionState: ClientDealerSelectionState = {
      dealerCards: availableCards,
      selectedCards: {},
      currentSelectingPlayerId: players[0].id,
      isComplete: false,
      tieBreakerPlayers: []
    };

    return {
      roomId,
      roomName,
      stage: 'dealer-selection',
      players,
      roundNumber: 1,
      stormWinningOrder: [],
      settings: {
        numberOfLaps: 3,
        numberOfDice: 2,
        numberOfDecks: 1,
        cardsPerHand: 4,
        numberOfCoins: 2
      },
      dealerSelection: dealerSelectionState
    };
  }
}

/**
 * Professional Game State Utilities
 */
export class GameStateUtils {
  /**
   * Deep clone a game state
   */
  static cloneGameState(gameState: ClientGameState): ClientGameState {
    return JSON.parse(JSON.stringify(gameState));
  }

  /**
   * Get player display information
   */
  static getPlayerDisplayInfo(player: Player): {
    displayName: string;
    colorClass: string;
    pawnColor: string;
  } {
    const colorMap: Record<string, { class: string; pawn: string }> = {
      yellow: { class: 'player-yellow', pawn: '#ca8a04' },
      orange: { class: 'player-orange', pawn: '#ea580c' },
      red: { class: 'player-red', pawn: '#dc2626' },
      pink: { class: 'player-pink', pawn: '#db2777' },
      purple: { class: 'player-purple', pawn: '#9333ea' },
      blue: { class: 'player-blue', pawn: '#2563eb' },
      green: { class: 'player-green', pawn: '#16a34a' },
      black: { class: 'player-black', pawn: '#18181b' }
    };

    const color = colorMap[player.color] || colorMap.blue;

    return {
      displayName: player.name,
      colorClass: color.class,
      pawnColor: color.pawn
    };
  }

  /**
   * Format card display name
   */
  static formatCardName(card: Card): string {
    const suitSymbols: Record<string, string> = {
      hearts: '♥️',
      diamonds: '♦️',
      spades: '♠️',
      clubs: '♣️'
    };

    return `${card.rank}${suitSymbols[card.suit] || ''}`;
  }
}

export default GameEngine;
