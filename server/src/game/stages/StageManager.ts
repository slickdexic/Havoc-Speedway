// Stage Manager - Handles game stage transitions and logic

import { GameState, Card } from '@havoc-speedway/shared';
import { CardDeck } from '../CardDeck.js';

export class StageManager {
  private deck: CardDeck;

  constructor() {
    this.deck = new CardDeck();
    console.log('🎭 StageManager initialized');
  }

  initializeDealerSelection(gameState: GameState): void {
    console.log('🎴 Initializing dealer selection stage');
    
    // Get all players in slot order (seat order)
    const players = Array.from(gameState.room.players.values())
      .sort((a, b) => a.roomSlot - b.roomSlot);
    
    if (players.length === 0) {
      console.error('No players found for dealer selection');
      return;
    }

    // Reset deck and deal one card to each player
    this.deck.reset();
    const dealtCards = new Map<string, Card>();
    
    for (const player of players) {
      const card = this.deck.dealCard();
      if (card) {
        dealtCards.set(player.id, card);
        console.log(`🎴 Dealt ${card.rank} of ${card.suit} to ${player.name}`);
      }
    }

    gameState.dealerSelection = {
      availableCards: [], // Not used in first round dealer selection
      selectedCards: dealtCards,
      currentSelector: '', // Not needed for initial dealer selection
      dealerDetermined: false
    };

    // Check if we have a clear winner or need to handle ties
    this.checkDealerSelectionResult(gameState);
  }

  advanceStage(gameState: GameState): boolean {
    console.log(`🔄 Advancing from stage: ${gameState.stage}`);
    
    switch (gameState.stage) {
      case 'dealer-selection':
        if (this.canAdvanceFromDealerSelection(gameState)) {
          gameState.stage = 'storm';
          this.initializeStormStage(gameState);
          return true;
        }
        break;
        
      case 'storm':
        if (this.canAdvanceFromStorm(gameState)) {
          if (gameState.roundNumber === 0) {
            gameState.stage = 'lane-selection';
            this.initializeLaneSelection(gameState);
          } else {
            gameState.stage = 'coin';
            this.initializeCoinStage(gameState);
          }
          return true;
        }
        break;
        
      case 'lane-selection':
        if (this.canAdvanceFromLaneSelection(gameState)) {
          gameState.stage = 'coin';
          this.initializeCoinStage(gameState);
          return true;
        }
        break;
        
      case 'coin':
        if (this.canAdvanceFromCoin(gameState)) {
          gameState.stage = 'racing';
          this.initializeRacingStage(gameState);
          return true;
        }
        break;
        
      case 'racing':
        if (this.canAdvanceFromRacing(gameState)) {
          gameState.roundNumber++;
          gameState.stage = 'storm';
          this.initializeStormStage(gameState);
          return true;
        }
        break;
    }
    
    return false;
  }

  handlePlayerAction(gameState: GameState, playerId: string, action: any): boolean {
    console.log(`🎮 Player action: ${playerId} -> ${action.type} in ${gameState.stage}`);
    
    switch (gameState.stage) {
      case 'dealer-selection':
        return this.handleDealerSelectionAction(gameState, playerId, action);
      case 'storm':
        return this.handleStormAction(gameState, playerId, action);
      case 'lane-selection':
        return this.handleLaneSelectionAction(gameState, playerId, action);
      case 'coin':
        return this.handleCoinAction(gameState, playerId, action);
      case 'racing':
        return this.handleRacingAction(gameState, playerId, action);
      default:
        return false;
    }
  }

  // Stage initialization methods
  private initializeStormStage(gameState: GameState): void {
    console.log('⛈️ Initializing Storm stage');
    // TODO: Implement Storm stage initialization
  }

  private initializeLaneSelection(gameState: GameState): void {
    console.log('🛣️ Initializing Lane Selection stage');
    // TODO: Implement lane selection initialization
  }

  private initializeCoinStage(gameState: GameState): void {
    console.log('🪙 Initializing Coin stage');
    // TODO: Implement coin stage initialization
  }

  private initializeRacingStage(gameState: GameState): void {
    console.log('🏁 Initializing Racing stage');
    // TODO: Implement racing stage initialization
  }

  // Stage advancement checks
  private canAdvanceFromDealerSelection(gameState: GameState): boolean {
    return gameState.dealerSelection?.dealerDetermined === true;
  }

  private canAdvanceFromStorm(gameState: GameState): boolean {
    return gameState.storm?.finishingOrder.length === gameState.room.players.size;
  }

  private canAdvanceFromLaneSelection(gameState: GameState): boolean {
    return gameState.laneSelection?.allLanesSelected === true;
  }

  private canAdvanceFromCoin(gameState: GameState): boolean {
    return gameState.coinStage?.allCoinsPlaced === true;
  }

  private canAdvanceFromRacing(gameState: GameState): boolean {
    return gameState.racing?.raceFinished === true;
  }

  // Action handlers
  private handleDealerSelectionAction(gameState: GameState, playerId: string, action: any): boolean {
    console.log('🎴 Handling dealer selection action');
    
    if (!gameState.dealerSelection) {
      console.error('No dealer selection state found');
      return false;
    }

    // Handle different types of dealer selection actions
    switch (action.type) {
      case 'redeal':
        // Allow host to force a redeal if there are issues
        if (gameState.room.hostId === playerId) {
          console.log('🔄 Host forcing redeal');
          this.initializeDealerSelection(gameState);
          return true;
        }
        break;
        
      case 'confirm_dealer':
        // Manual confirmation of dealer (for edge cases)
        if (gameState.room.hostId === playerId && action.dealerId) {
          const targetPlayer = gameState.room.players.get(action.dealerId);
          if (targetPlayer) {
            gameState.dealerSelection.dealerId = action.dealerId;
            gameState.dealerButton = action.dealerId;
            gameState.dealerSelection.dealerDetermined = true;
            console.log(`🏆 Host manually set dealer: ${targetPlayer.name}`);
            return true;
          }
        }
        break;
    }
    
    return false;
  }

  private handleStormAction(gameState: GameState, playerId: string, action: any): boolean {
    // TODO: Implement storm actions
    console.log('⛈️ Handling storm action');
    return false;
  }

  private handleLaneSelectionAction(gameState: GameState, playerId: string, action: any): boolean {
    // TODO: Implement lane selection actions
    console.log('🛣️ Handling lane selection action');
    return false;
  }

  private handleCoinAction(gameState: GameState, playerId: string, action: any): boolean {
    // TODO: Implement coin actions
    console.log('🪙 Handling coin action');
    return false;
  }

  private handleRacingAction(gameState: GameState, playerId: string, action: any): boolean {
    // TODO: Implement racing actions
    console.log('🏁 Handling racing action');
    return false;
  }

  /**
   * Check the result of dealer selection and handle ties
   */
  private checkDealerSelectionResult(gameState: GameState): void {
    if (!gameState.dealerSelection) {
      console.error('No dealer selection state found');
      return;
    }

    const selectedCards = gameState.dealerSelection.selectedCards;
    const playerCards: Array<{playerId: string, card: Card, value: number}> = [];

    // Get card values for all players
    for (const [playerId, card] of selectedCards.entries()) {
      const value = CardDeck.getCardValue(card);
      playerCards.push({ playerId, card, value });
    }

    // Sort by card value (highest first)
    playerCards.sort((a, b) => b.value - a.value);

    const highestValue = playerCards[0]?.value;
    const tiedPlayers = playerCards.filter(pc => pc.value === highestValue);

    if (tiedPlayers.length === 1) {
      // Clear winner
      const dealerId = tiedPlayers[0].playerId;
      gameState.dealerSelection.dealerId = dealerId;
      gameState.dealerButton = dealerId; // Also set the cross-stage dealer button
      gameState.dealerSelection.dealerDetermined = true;
      
      const dealer = gameState.room.players.get(dealerId);
      console.log(`🏆 Dealer determined: ${dealer?.name} with ${tiedPlayers[0].card.rank} of ${tiedPlayers[0].card.suit}`);
    } else {
      // Handle tie - need another round
      console.log(`🔄 Tie detected between ${tiedPlayers.length} players - dealing again`);
      this.handleDealerSelectionTie(gameState, tiedPlayers);
    }
  }

  /**
   * Handle tie-breaking for dealer selection
   */
  private handleDealerSelectionTie(gameState: GameState, tiedPlayers: Array<{playerId: string, card: Card, value: number}>): void {
    if (!gameState.dealerSelection) return;

    console.log('🎴 Breaking tie between players...');
    
    // Deal new cards only to tied players
    const newCards = new Map<string, Card>();
    
    // Keep existing cards for non-tied players
    for (const [playerId, card] of gameState.dealerSelection.selectedCards.entries()) {
      const isTied = tiedPlayers.some(tp => tp.playerId === playerId);
      if (!isTied) {
        newCards.set(playerId, card);
      }
    }

    // Deal new cards to tied players
    for (const tiedPlayer of tiedPlayers) {
      const newCard = this.deck.dealCard();
      if (newCard) {
        newCards.set(tiedPlayer.playerId, newCard);
        const player = gameState.room.players.get(tiedPlayer.playerId);
        console.log(`🎴 New card for ${player?.name}: ${newCard.rank} of ${newCard.suit}`);
      }
    }

    gameState.dealerSelection.selectedCards = newCards;
    
    // Check again for winner
    this.checkDealerSelectionResult(gameState);
  }
}
