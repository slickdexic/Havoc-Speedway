// Stage Manager - Handles game stage transitions and logic

import { GameState, Card, StormGameState, LaneSelectionState, CoinStageState, DealerSelectionState, Player } from '@havoc-speedway/shared';
import { Lane, Coin, RacingState, PawnState, TrackPosition, CoinValue } from '@havoc-speedway/shared';
import { PlayerAction } from '@havoc-speedway/shared';
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
      .sort((a: Player, b: Player) => a.roomSlot - b.roomSlot);
    
    if (players.length === 0) {
      console.error('No players found for dealer selection');
      return;
    }

    // Reset deck and deal 18 cards for the 3x6 grid
    this.deck.reset();
    const dealerCards = this.deck.dealDealerSelectionCards(); // 18 cards
    
    // Add position information for the 3x6 grid
    dealerCards.forEach((card, index) => {
      const row = Math.floor(index / 6);
      const col = index % 6;
      // Set position and flip state using type assertion for now
      (card as any).position = { x: col, y: row };
      (card as any).isFlipped = false; // Start face-down
    });

    // Create dealer selection state
    const dealerSelectionState: DealerSelectionState = {
      dealerCards,
      selectedCards: {},
      currentSelectingPlayerId: players[0].id, // First player in seat order
      dealerId: undefined,
      isComplete: false,
      tieBreakerPlayers: [] // Initialize tie-breaker array
    };
    (gameState as any).dealerSelection = dealerSelectionState;

    console.log(`🎴 Dealt 18 cards for dealer selection. First player: ${players[0].name}`);
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

  handlePlayerAction(gameState: GameState, playerId: string, action: PlayerAction): boolean {
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
    console.log('🌪️ Initializing Storm stage...');

    const settings = gameState.room.settings;
    
    // Use single or double deck based on settings
    this.deck.reset(settings.numberOfDecks === 2);
    this.deck.shuffle();

    // Deal cards to each player
    const playerHands = new Map<string, { playerId: string; cards: Card[]; cardCount: number }>();
    const playerIds = Array.from(gameState.room.players.keys());
    
    // Deal cards one at a time in clockwise order
    for (let cardIndex = 0; cardIndex < settings.cardsPerHand; cardIndex++) {
      for (const playerId of playerIds) {
        const card = this.deck.dealCard();
        if (card) {
          if (!playerHands.has(playerId)) {
            playerHands.set(playerId, { playerId, cards: [], cardCount: 0 });
          }
          const hand = playerHands.get(playerId)!;
          hand.cards.push(card);
          hand.cardCount = hand.cards.length;
        }
      }
    }

    // Deal initial discard card
    const initialCard = this.deck.dealCard();
    if (!initialCard) {
      console.error('Failed to deal initial card for Storm stage');
      return;
    }

    // Initialize Storm game state using type assertion for now
    const storm: any = {
      playerHands,
      discardPile: [initialCard],
      stockPile: this.deck.getRemainingCards(),
      currentPlayerId: this.determineFirstPlayer(gameState, initialCard),
      toxicSevenActive: initialCard.rank === '7',
      toxicDrawAmount: initialCard.rank === '7' ? 2 : 0,
      calledSuit: this.determineInitialSuit(initialCard),
      finishingOrder: [],
      isComplete: false
    };

    gameState.storm = storm;
    gameState.stage = 'storm';

    console.log(`🌪️ Storm stage initialized: ${playerHands.size} players, ${settings.cardsPerHand} cards each`);
    console.log(`🎴 Initial discard: ${initialCard.rank} of ${initialCard.suit}`);
    console.log(`👤 First player: ${gameState.room.players.get(storm.currentPlayerId)?.name}`);
  }

  private initializeLaneSelection(gameState: GameState): void {
    console.log('🛣️ Initializing Lane Selection stage');
    
    const allLanes: Lane[] = [1, 2, 3, 4];
    const availableLanes = [...allLanes];
    
    // Determine first selector based on Storm finishing order
    const stormOrder = gameState.stormWinningOrder;
    const firstSelector = stormOrder.length > 0 ? stormOrder[0] : Array.from(gameState.room.players.keys())[0];
    
    (gameState as any).laneSelection = {
      availableLanes,
      selectedLanes: new Map(),
      currentSelector: firstSelector,
      allLanesSelected: false
    };

    console.log(`🛣️ Lane selection initialized. First selector: ${gameState.room.players.get(firstSelector)?.name}`);
  }

  private initializeCoinStage(gameState: GameState): void {
    console.log('🪙 Initializing Coin stage');
    
    // Distribute coins based on Storm finishing order
    const coinDistribution = new Map<string, number>();
    const drawnCoins = new Map<string, Coin[]>();
    
    // Get Storm finishing order
    const stormOrder = gameState.stormWinningOrder;
    if (stormOrder.length === 0) {
      console.error('No Storm finishing order available for coin distribution');
      return;
    }

    // Coin distribution: 1st place gets more coins, last place gets fewer
    const totalPlayers = stormOrder.length;
    const baseCoins = gameState.room.settings.numberOfCoins;
    
    stormOrder.forEach((playerId, index) => {
      // 1st place gets base coins, others get fewer
      let coinCount = Math.max(1, baseCoins - index);
      
      coinDistribution.set(playerId, coinCount);
      
      // Draw coins from purse for each player
      const playerCoins = this.drawCoinsFromPurse(playerId, coinCount);
      drawnCoins.set(playerId, playerCoins);
      
      const player = gameState.room.players.get(playerId);
      console.log(`🪙 ${player?.name} gets ${coinCount} coins (${index + 1}${this.getOrdinalSuffix(index + 1)} place)`);
    });

    (gameState as any).coinStage = {
      coinDistribution,
      drawnCoins,
      placedCoins: [],
      currentPlacer: stormOrder[0], // First place starts
      allCoinsPlaced: false
    };

    console.log(`🪙 Coin stage initialized. First placer: ${gameState.room.players.get(stormOrder[0])?.name}`);
  }

  private initializeRacingStage(gameState: GameState): void {
    console.log('🏁 Initializing Racing stage');
    
    // Initialize pawn positions at start line in selected lanes
    const pawns = new Map<string, PawnState>();
    const allCoins = new Map<string, Coin>();
    
    // Place pawns at starting positions
    const laneSelection = (gameState as any).laneSelection;
    if (laneSelection) {
      for (const [playerId, lane] of laneSelection.selectedLanes) {
        const pawn: PawnState = {
          playerId,
          currentPosition: 96, // Start line is position 96
          lane,
          lapNumber: 0,
          coordinates: this.getTrackCoordinates(96, lane)
        };
        pawns.set(playerId, pawn);
        
        const player = gameState.room.players.get(playerId);
        console.log(`🏁 ${player?.name} starting in lane ${lane}`);
      }
    }

    // Place coins from coin stage
    const coinStage = (gameState as any).coinStage;
    if (coinStage) {
      coinStage.placedCoins.forEach((coin: Coin) => {
        allCoins.set(coin.id, coin);
      });
      console.log(`🪙 ${allCoins.size} coins placed on track`);
    }

    // Determine first racer (based on Storm order again)
    const firstRacer = gameState.stormWinningOrder[0] || Array.from(gameState.room.players.keys())[0];

    (gameState as any).racing = {
      pawns,
      coins: allCoins,
      currentRacingPlayer: firstRacer,
      raceFinished: false,
      finishingOrder: [],
      lapTarget: gameState.room.settings.numberOfLaps
    };

    console.log(`🏁 Racing stage initialized. First racer: ${gameState.room.players.get(firstRacer)?.name}`);
  }

  // Helper methods
  private drawCoinsFromPurse(playerId: string, count: number): Coin[] {
    // Create random coins for the player
    const coinValues: CoinValue[] = ['+2', '+3', '+4', '+5', '-2', '-3', '-4', '-5'];
    const coins: Coin[] = [];
    
    for (let i = 0; i < count; i++) {
      const randomValue = coinValues[Math.floor(Math.random() * coinValues.length)];
      const coin: Coin = {
        id: `${playerId}-coin-${i}`,
        value: randomValue,
        ownerId: playerId,
        position: 1, // Will be set when placed
        lane: 1, // Will be set when placed
        coordinates: { x: 0, y: 0 }, // Will be set when placed
        isRevealed: false
      };
      coins.push(coin);
    }
    
    return coins;
  }

  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  private getTrackCoordinates(position: TrackPosition, lane: Lane): { x: number; y: number } {
    // Server-side track coordinate calculation
    // This mirrors the client-side TrackCoordinates utility
    
    // Key positions from the track specification
    const keyPositions: { [key: string]: { x: number; y: number } } = {
      // Starting positions (spot 96 - pole positions)
      '96-1': { x: 14.4174, y: -0.5 },
      '96-2': { x: 15.4174, y: -0.5 },
      '96-3': { x: 16.4174, y: -0.5 },
      '96-4': { x: 17.4174, y: -0.5 },

      // First positions after start/finish line
      '1-1': { x: 14.4174, y: 0.5 },
      '1-2': { x: 15.4174, y: 0.5 },
      '1-3': { x: 16.4174, y: 0.5 },
      '1-4': { x: 17.4174, y: 0.5 },

      // Right straight positions
      '2-1': { x: 14.4174, y: 1.5 },
      '3-1': { x: 14.4174, y: 2.5 },
      '4-1': { x: 14.4174, y: 3.5 },
      '5-1': { x: 14.4174, y: 4.5 },

      // Sample positions from other sections
      '20-1': { x: 4.5, y: 14.4174 },
      '44-1': { x: -14.4174, y: 4.5 },
      '68-1': { x: -4.5, y: -14.4174 },
      '92-1': { x: 14.4174, y: -4.5 }
    };

    const key = `${position}-${lane}`;
    
    // If we have exact coordinates, use them
    if (keyPositions[key]) {
      return keyPositions[key];
    }

    // If we have lane 1 coordinates, calculate other lanes
    const baseLaneKey = `${position}-1`;
    if (keyPositions[baseLaneKey]) {
      const basePos = keyPositions[baseLaneKey];
      const laneOffset = lane - 1;
      
      // Determine if this is a straight section and adjust accordingly
      if (this.isStraightSection(position)) {
        return this.adjustStraightPosition(basePos, laneOffset, position);
      } else {
        return this.adjustCornerPosition(basePos, laneOffset);
      }
    }

    // Fallback: generate approximate coordinates
    return this.generateApproximateCoordinates(position, lane);
  }

  private isStraightSection(spot: number): boolean {
    return (
      (spot >= 1 && spot <= 5) ||    // Right straight
      (spot >= 20 && spot <= 29) ||  // Top straight
      (spot >= 44 && spot <= 53) ||  // Left straight
      (spot >= 68 && spot <= 77) ||  // Bottom straight
      (spot >= 92 && spot <= 96)     // Final straight
    );
  }

  private adjustStraightPosition(basePos: { x: number; y: number }, laneOffset: number, spot: number): { x: number; y: number } {
    let adjustedX = basePos.x;
    let adjustedY = basePos.y;

    // Determine which straight section this is
    if (basePos.x > 10) {
      // Right straight - offset in X direction (move away from track center)
      adjustedX = basePos.x + laneOffset;
    } else if (basePos.x < -10) {
      // Left straight - offset in X direction (move toward track center)
      adjustedX = basePos.x - laneOffset;
    } else if (basePos.y > 10) {
      // Top straight - offset in Y direction (move away from track center)
      adjustedY = basePos.y + laneOffset;
    } else if (basePos.y < -10) {
      // Bottom straight - offset in Y direction (move toward track center)
      adjustedY = basePos.y - laneOffset;
    }

    return { x: adjustedX, y: adjustedY };
  }

  private adjustCornerPosition(basePos: { x: number; y: number }, laneOffset: number): { x: number; y: number } {
    // For corners, maintain the curved path
    const angle = Math.atan2(basePos.y, basePos.x);
    const radius = Math.sqrt(basePos.x * basePos.x + basePos.y * basePos.y);
    const adjustedRadius = radius + laneOffset;

    return {
      x: Math.cos(angle) * adjustedRadius,
      y: Math.sin(angle) * adjustedRadius
    };
  }

  private generateApproximateCoordinates(position: TrackPosition, lane: Lane): { x: number; y: number } {
    // Simplified track layout: oval with 96 positions
    const angle = (position / 96) * 2 * Math.PI;
    const baseRadius = 10 + lane; // Lane offset for radius
    
    return {
      x: Math.cos(angle) * baseRadius,
      y: Math.sin(angle) * baseRadius
    };
  }

  // Stage advancement checks
  private canAdvanceFromDealerSelection(gameState: GameState): boolean {
    const dealerSelection = (gameState as any).dealerSelection;
    return dealerSelection?.isComplete === true;
  }

  private canAdvanceFromStorm(gameState: GameState): boolean {
    return gameState.storm?.finishingOrder.length === gameState.room.players.size;
  }

  private canAdvanceFromLaneSelection(gameState: GameState): boolean {
    const laneSelection = (gameState as any).laneSelection;
    return laneSelection?.allLanesSelected === true;
  }

  private canAdvanceFromCoin(gameState: GameState): boolean {
    const coinStage = (gameState as any).coinStage;
    return coinStage?.allCoinsPlaced === true;
  }

  private canAdvanceFromRacing(gameState: GameState): boolean {
    const racing = (gameState as any).racing;
    return racing?.raceFinished === true;
  }

  // Action handlers
  private handleDealerSelectionAction(gameState: GameState, playerId: string, action: PlayerAction): boolean {
    console.log('🎴 Handling dealer selection action');
    
    const dealerSelection = (gameState as any).dealerSelection;
    if (!dealerSelection || dealerSelection.isComplete) {
      console.error('Invalid dealer selection state');
      return false;
    }

    // Check if it's this player's turn to select
    if (dealerSelection.currentSelectingPlayerId !== playerId) {
      console.log(`❌ Not ${playerId}'s turn to select a card`);
      return false;
    }

    // Handle card selection
    if (action.type === 'SELECT_DEALER_CARD') {
      const cardId = action.cardId;
      const selectedCard = dealerSelection.dealerCards.find((card: any) => card.id === cardId);
      
      if (!selectedCard) {
        console.log(`❌ Card not found: ${cardId}`);
        return false;
      }

      if (selectedCard.isFlipped) {
        console.log(`❌ Card already selected: ${cardId}`);
        return false;
      }

      // Flip the card and assign it to the player
      selectedCard.isFlipped = true;
      dealerSelection.selectedCards[playerId] = selectedCard;
      
      const player = gameState.room.players.get(playerId);
      console.log(`🎴 ${player?.name} selected ${selectedCard.rank} of ${selectedCard.suit}`);

      // Move to next player
      this.advanceToNextSelector(gameState);
      
      // Check if we can determine the dealer
      this.checkDealerSelectionResult(gameState);
      
      return true;
    }

    return false;
  }

  private handleStormAction(gameState: GameState, playerId: string, action: PlayerAction): boolean {
    console.log(`⛈️ Handling storm action: ${action.type} from ${playerId}`);
    
    const storm = gameState.storm;
    if (!storm || storm.isComplete) {
      console.error('Invalid storm state');
      return false;
    }

    // Check if it's this player's turn
    if (storm.currentPlayerId !== playerId) {
      console.log(`❌ Not ${playerId}'s turn`);
      return false;
    }

    const player = gameState.room.players.get(playerId);
    const playerHand = storm.playerHands.get(playerId);
    
    if (!player || !playerHand) {
      console.error(`Player or hand not found: ${playerId}`);
      return false;
    }

    switch (action.type) {
      case 'PLAY_CARD':
        return this.handlePlayCard(gameState, playerId, action.cardId, action.calledSuit);
        
      case 'DRAW_CARDS':
        return this.handleDrawCards(gameState, playerId);
        
      default:
        console.log(`❌ Unknown storm action: ${action.type}`);
        return false;
    }
  }

  private handlePlayCard(gameState: GameState, playerId: string, cardId: string, calledSuit?: string): boolean {
    const storm = gameState.storm!;
    const playerHand = storm.playerHands.get(playerId)!;
    const topCard = storm.discardPile[storm.discardPile.length - 1];
    
    // Find the card in player's hand
    const cardIndex = playerHand.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      console.log(`❌ Card not found in player's hand: ${cardId}`);
      return false;
    }
    
    const playedCard = playerHand.cards[cardIndex];
    
    // Validate the play
    if (!this.isValidPlay(playedCard, topCard, storm, calledSuit)) {
      console.log(`❌ Invalid play: ${playedCard.rank} of ${playedCard.suit}`);
      return false;
    }

    // Remove card from player's hand
    playerHand.cards.splice(cardIndex, 1);
    playerHand.cardCount = playerHand.cards.length;
    
    // Add card to discard pile
    storm.discardPile.push(playedCard);
    
    console.log(`✅ ${gameState.room.players.get(playerId)?.name} played ${playedCard.rank} of ${playedCard.suit}`);

    // Handle special card effects
    this.handleCardEffects(gameState, playedCard, calledSuit);
    
    // Check if player finished
    if (playerHand.cardCount === 0) {
      console.log(`🏆 ${gameState.room.players.get(playerId)?.name} finished!`);
      storm.finishingOrder.push(playerId);
      
      // Check if game is complete
      if (storm.finishingOrder.length === gameState.room.players.size - 1) {
        // Last player automatically gets last place
        const remainingPlayers = Array.from(gameState.room.players.keys())
          .filter(id => !storm.finishingOrder.includes(id));
        if (remainingPlayers.length === 1) {
          storm.finishingOrder.push(remainingPlayers[0]);
        }
        storm.isComplete = true;
        gameState.stormWinningOrder = [...storm.finishingOrder];
        console.log('🌪️ Storm stage complete!');
        return true;
      }
    }

    // Advance to next player (unless current player was skipped)
    this.advanceToNextStormPlayer(gameState);
    
    return true;
  }

  private handleDrawCards(gameState: GameState, playerId: string): boolean {
    const storm = gameState.storm!;
    const playerHand = storm.playerHands.get(playerId)!;
    
    // Check if player must draw due to toxic 7
    let drawCount = 1; // Default draw count
    
    if (storm.toxicSevenActive) {
      drawCount = storm.toxicDrawAmount;
      // Reset toxic 7 after drawing
      storm.toxicSevenActive = false;
      storm.toxicDrawAmount = 0;
      console.log(`💀 ${gameState.room.players.get(playerId)?.name} draws ${drawCount} cards due to toxic 7`);
    } else {
      console.log(`📤 ${gameState.room.players.get(playerId)?.name} draws 1 card`);
    }
    
    // Draw cards from stock pile
    for (let i = 0; i < drawCount; i++) {
      if (storm.stockPile.length === 0) {
        // Reshuffle discard pile if stock is empty
        this.reshuffleDiscardPile(gameState);
      }
      
      if (storm.stockPile.length > 0) {
        const drawnCard = storm.stockPile.pop()!;
        playerHand.cards.push(drawnCard);
        playerHand.cardCount = playerHand.cards.length;
      }
    }
    
    // Turn ends after drawing
    this.advanceToNextStormPlayer(gameState);
    
    return true;
  }

  private isValidPlay(playedCard: Card, topCard: Card, storm: any, calledSuit?: string): boolean {
    // If toxic 7 is active, the only valid play is another 7.
    if (storm.toxicSevenActive) {
      return playedCard.rank === '7';
    }

    // Queens are wild cards (but cannot be played on a toxic 7, handled above)
    if (playedCard.rank === 'Q') {
      // Must provide called suit when playing Queen, unless it's the last card
      if (!calledSuit && storm.playerHands.get(storm.currentPlayerId)?.cards.length > 1) {
        console.log('❌ Must call suit when playing Queen');
        return false;
      }
      return true;
    }

    // Determine the effective suit to match
    let targetSuit = topCard.suit;
    if (storm.calledSuit) {
      targetSuit = storm.calledSuit;
    }

    // Match rank or suit
    return playedCard.rank === topCard.rank || playedCard.suit === targetSuit;
  }

  private handleCardEffects(gameState: GameState, playedCard: Card, calledSuit?: string): void {
    const storm = gameState.storm!;

    switch (playedCard.rank) {
      case 'A':
        // Skip next player
        console.log('🃑 Ace played - next player skipped');
        this.skipNextStormPlayer(gameState);
        break;

      case 'Q':
        // Set called suit
        if (calledSuit && ['hearts', 'diamonds', 'spades', 'clubs'].includes(calledSuit)) {
          storm.calledSuit = calledSuit as 'hearts' | 'diamonds' | 'spades' | 'clubs';
          console.log(`👸 Queen played - suit called: ${calledSuit}`);
        } else {
          // Clear called suit if no suit specified (game ending)
          storm.calledSuit = undefined;
        }
        break;

      case '7':
        // Handle toxic 7
        if (storm.toxicSevenActive) {
          // Stack another 7
          storm.toxicDrawAmount += 2;
          console.log(`💀 Toxic 7 stacked - draw amount now: ${storm.toxicDrawAmount}`);
        } else {
          // New toxic 7
          storm.toxicSevenActive = true;
          storm.toxicDrawAmount = 2;
          console.log('💀 Toxic 7 activated - next player must play 7 or draw 2');
        }
        break;

      default:
        // Clear called suit for non-Queen cards
        storm.calledSuit = undefined;
        break;
    }
  }

  private advanceToNextStormPlayer(gameState: GameState): void {
    const storm = gameState.storm!;
    const playerIds = Array.from(gameState.room.players.keys());
    const currentIndex = playerIds.indexOf(storm.currentPlayerId);
    
    // Find next player who hasn't finished
    let nextIndex = currentIndex;
    do {
      nextIndex = (nextIndex + 1) % playerIds.length;
    } while (storm.finishingOrder.includes(playerIds[nextIndex]) && nextIndex !== currentIndex);
    
    storm.currentPlayerId = playerIds[nextIndex];
    
    const nextPlayer = gameState.room.players.get(storm.currentPlayerId);
    console.log(`📍 Next storm player: ${nextPlayer?.name}`);
  }

  private skipNextStormPlayer(gameState: GameState): void {
    // Skip one additional player due to Ace
    this.advanceToNextStormPlayer(gameState);
  }

  private reshuffleDiscardPile(gameState: GameState): void {
    const storm = gameState.storm!;
    
    if (storm.discardPile.length <= 1) {
      console.log('⚠️ Cannot reshuffle - not enough cards in discard pile');
      return;
    }
    
    // Keep top card, reshuffle the rest
    const topCard = storm.discardPile.pop()!;
    storm.stockPile = [...storm.discardPile];
    storm.discardPile = [topCard];
    
    // Shuffle the new stock pile
    for (let i = storm.stockPile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [storm.stockPile[i], storm.stockPile[j]] = [storm.stockPile[j], storm.stockPile[i]];
    }
    
    console.log(`♻️ Reshuffled discard pile: ${storm.stockPile.length} cards back to stock`);
  }

  private handleLaneSelectionAction(gameState: GameState, playerId: string, action: PlayerAction): boolean {
    console.log('🛣️ Handling lane selection action');
    
    const laneSelection = (gameState as any).laneSelection;
    if (!laneSelection || action.type !== 'SELECT_LANE') {
      return false;
    }

    // Check if it's this player's turn
    if (laneSelection.currentSelector !== playerId) {
      console.log(`❌ Not ${playerId}'s turn to select lane`);
      return false;
    }

    const selectedLane: Lane = action.lane;
    
    // Check if lane is available
    if (!laneSelection.availableLanes.includes(selectedLane)) {
      console.log(`❌ Lane ${selectedLane} not available`);
      return false;
    }

    // Assign lane to player
    laneSelection.selectedLanes.set(playerId, selectedLane);
    
    // Remove lane from available lanes
    const laneIndex = laneSelection.availableLanes.indexOf(selectedLane);
    laneSelection.availableLanes.splice(laneIndex, 1);
    
    const player = gameState.room.players.get(playerId);
    console.log(`🛣️ ${player?.name} selected lane ${selectedLane}`);

    // Move to next selector
    this.advanceToNextLaneSelector(gameState);
    
    return true;
  }

  private handleCoinAction(gameState: GameState, playerId: string, action: any): boolean {
    console.log('🪙 Handling coin action');

    const coinStage = gameState.coinStage;
    if (!coinStage || action.type !== 'PLACE_COIN') {
      return false;
    }

    // Check if it's this player's turn
    if (coinStage.currentPlacer !== playerId) {
      console.log(`❌ Not ${playerId}'s turn to place coin`);
      return false;
    }

    const { position, lane } = action.position;

    // --- START: Enhanced Coin Placement Validation ---

    // Rule 1: No coins in pit or pit-lane areas (approximated as start/finish line area)
    if (position >= 93 || position <= 0) { // Position 96 is start line, so 93-96 is restricted.
        console.log(`❌ Invalid coin placement: Cannot place in the start/finish/pit area (position ${position}).`);
        // NOTE: Consider sending an error message back to the client.
        return false;
    }

    // Rule 2: No coins in 6 spaces directly in front of starting pawns (pos 1-6)
    const laneSelection = gameState.laneSelection;
    if (laneSelection) {
      const occupiedLanes = Array.from(laneSelection.selectedLanes.values());
      if (position >= 1 && position <= 6 && occupiedLanes.includes(lane)) {
        console.log(`❌ Invalid coin placement: Cannot place in the first 6 spaces of an occupied lane.`);
        return false;
      }
    }

    // Rule 3: No placing a coin on top of an existing coin.
    if (coinStage.placedCoins.some(c => c.position === position && c.lane === lane)) {
        console.log(`❌ Invalid coin placement: A coin already exists at position ${position}, lane ${lane}.`);
        return false;
    }
    // --- END: Enhanced Coin Placement Validation ---

    const player = gameState.room.players.get(playerId);

    // Get player's available coins
    const playerCoins = coinStage.drawnCoins.get(playerId) || [];
    if (playerCoins.length === 0) {
      console.log(`❌ ${player?.name} has no coins to place`);
      return false;
    }

    // Take the first available coin
    const coinToPlace = playerCoins.shift()!;
    
    // Set coin position and coordinates
    coinToPlace.position = position;
    coinToPlace.lane = lane;
    coinToPlace.coordinates = this.getTrackCoordinates(position, lane);
    
    // Add to placed coins
    coinStage.placedCoins.push(coinToPlace);
    
    console.log(`🪙 ${player?.name} placed coin (${coinToPlace.value}) at position ${position}, lane ${lane}`);

    // Move to next placer
    this.advanceToNextCoinPlacer(gameState);
    
    return true;
  }

  private handleRacingAction(gameState: GameState, playerId: string, action: any): boolean {
    console.log(`🏁 Handling racing action: ${action.type} from ${playerId}`);
    
    const racing = (gameState as any).racing;
    if (!racing || racing.raceFinished) {
      console.error('Invalid racing state');
      return false;
    }

    // Check if it's this player's turn
    if (racing.currentRacingPlayer !== playerId) {
      console.log(`❌ Not ${playerId}'s turn to race`);
      return false;
    }

    const player = gameState.room.players.get(playerId);
    const pawn = racing.pawns.get(playerId);
    
    if (!player || !pawn) {
      console.error(`Player or pawn not found: ${playerId}`);
      return false;
    }

    switch (action.type) {
      case 'ROLL_DICE':
        return this.handleRollDice(gameState, playerId, action.diceType);
        
      case 'CONFIRM_MOVEMENT':
        return this.handleConfirmMovement(gameState, playerId);
        
      default:
        console.log(`❌ Unknown racing action: ${action.type}`);
        return false;
    }
  }

  private handleRollDice(gameState: GameState, playerId: string, diceType: 'standard' | 'lane-change'): boolean {
    const racing = gameState.racing;
    if (!racing) return false;

    const pawn = racing.pawns[playerId];
    if (!pawn) return false;

    let diceResultForRollObject: any;
    let movementResult: any;
    let loggableDiceResult: string;

    if (diceType === 'standard') {
        const isInPit = pawn.currentPosition === 'pit';
        const numDice = isInPit ? 1 : gameState.room.settings.numberOfDice;
        
        const rolls: number[] = [];
        for (let i = 0; i < numDice; i++) {
            rolls.push(this.rollStandardDie());
        }
        const totalRoll = rolls.reduce((a, b) => a + b, 0);

        diceResultForRollObject = numDice > 1 ? rolls : rolls[0];
        loggableDiceResult = numDice > 1 ? `${rolls.join(' + ')} = ${totalRoll}` : `${totalRoll}`;
        
        movementResult = this.calculateStandardMovement(gameState, playerId, totalRoll);
    } else { // lane-change
        const roll = this.rollLaneChangeDie();
        diceResultForRollObject = roll;
        loggableDiceResult = roll;
        movementResult = this.calculateLaneChangeMovement(gameState, playerId, roll);
    }

    // Store the dice roll
    const diceRoll = {
      playerId,
      diceType,
      result: diceResultForRollObject,
      timestamp: Date.now()
    };

    // Store temporary movement state for confirmation
    racing.pendingMovement = {
      playerId,
      diceRoll,
      movementResult,
      confirmed: false
    };

    const player = gameState.room.players.get(playerId);
    console.log(`🎲 ${player?.name} rolled ${diceType} dice: ${loggableDiceResult}`);

    return true;
  }

  private handleConfirmMovement(gameState: GameState, playerId: string): boolean {
    const racing = gameState.racing;
    if (!racing) return false;

    const pendingMovement = racing.pendingMovement;

    if (!pendingMovement || pendingMovement.playerId !== playerId) {
      console.log('❌ No pending movement or wrong player');
      return false;
    }

    const movementResult = pendingMovement.movementResult;
    const pawn = racing.pawns[playerId];
    if (!pawn) return false;

    // Apply the movement
    pawn.currentPosition = movementResult.newPosition;
    pawn.lane = movementResult.newLane;
    pawn.coordinates = movementResult.newCoordinates;
    if (movementResult.pitPosition) {
        pawn.pitPosition = movementResult.pitPosition;
    }


    // Handle lap completion
    if (movementResult.lapCompleted) {
      pawn.lapNumber++;
      console.log(`🏃 ${gameState.room.players.get(playerId)?.name} completed lap ${pawn.lapNumber}`);
    }

    // Handle coins triggered
    if (movementResult.coinsTriggered.length > 0) {
      for (const coin of movementResult.coinsTriggered) {
        this.handleCoinTrigger(gameState, playerId, coin);
      }
    }

    // Check for race finish
    if (movementResult.raceFinished) {
      racing.finishingOrder.push(playerId);
      console.log(`🏆 ${gameState.room.players.get(playerId)?.name} finished the race!`);

      // Check if race is complete
      this.checkRaceCompletion(gameState);
    }

    // Clear pending movement
    delete racing.pendingMovement;

    // Advance to the next player
    this.advanceToNextRacingPlayer(gameState);

    return true;
  }

  private rollStandardDie(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  private rollLaneChangeDie(): 'L1' | 'R1' | 'L2' | 'R2' | 'check-engine' {
    // As per rules, 2 faces are 'check-engine'
    const outcomes: ('L1' | 'R1' | 'L2' | 'R2' | 'check-engine')[] = [
        'L1', 'R1', 'L2', 'R2', 'check-engine', 'check-engine'
    ];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  }

  private calculateStandardMovement(gameState: GameState, playerId: string, diceResult: number): any {
    const pawn = gameState.racing?.pawns[playerId];
    if (!pawn) return;

    const player = gameState.room.players.get(playerId);
    console.log(`🎲 ${player?.name} rolled ${diceResult} on standard die`);

    // Handle different pawn locations
    if (pawn.currentPosition === 'pit') {
      return this.handlePitMovement(gameState, playerId, diceResult);
    } else if (pawn.currentPosition === 'pit-lane') {
      return this.handlePitLaneMovement(gameState, playerId, diceResult);
    } else {
      return this.handleTrackMovement(gameState, playerId, diceResult);
    }
  }

  private calculateLaneChangeMovement(gameState: GameState, playerId: string, diceResult: string): any {
    const racing = (gameState as any).racing;
    const pawn = racing.pawns.get(playerId)!;
    const player = gameState.room.players.get(playerId);
    
    console.log(`� ${player?.name} rolled ${diceResult} on lane-change die`);
    
    // Check engine means turn ends
    if (diceResult === 'check-engine') {
      console.log(`🔧 ${player?.name}'s turn ends (check engine)`);
      return {
        success: false,
        newPosition: pawn.currentPosition,
        newLane: pawn.lane,
        newCoordinates: pawn.coordinates,
        coinsTriggered: [],
        lapCompleted: false,
        raceFinished: false
      };
    }
    
    // Handle lane changes
    return this.handleLaneChange(gameState, playerId, diceResult);
  }

  private handlePitMovement(gameState: GameState, playerId: string, diceResult: number): any {
    const racing = (gameState as any).racing;
    const pawn = racing.pawns.get(playerId)!;
    const player = gameState.room.players.get(playerId);
    
    // Rolling 6 in pit crashes into wall, stay in pit
    if (diceResult === 6) {
      console.log(`💥 ${player?.name} crashed in pit (rolled 6), staying in pit`);
      return {
        success: false,
        newPosition: 'pit',
        newLane: pawn.lane,
        newCoordinates: { x: 12.0, y: pawn.lane * 1.2 + 0.7 }, // Pit coordinates
        coinsTriggered: [],
        lapCompleted: false,
        raceFinished: false,
        obstruction: {
          blockedBy: 'wall',
          finalPosition: 'pit'
        }
      };
    }
    
    // Successful move to pit-lane
    const pitLanePosition = Math.min(diceResult, 5); // Max 5 spaces in pit-lane
    console.log(`🚗 ${player?.name} moves from pit to pit-lane space ${pitLanePosition}`);
    
    return {
      success: true,
      newPosition: 'pit-lane',
      newLane: pawn.lane,
      newCoordinates: { x: 13.4174, y: pitLanePosition * 0.5 },
      coinsTriggered: [],
      lapCompleted: false,
      raceFinished: false,
      pitPosition: pitLanePosition
    };
  }

  private handlePitLaneMovement(gameState: GameState, playerId: string, diceResult: number): any {
    const racing = (gameState as any).racing;
    const pawn = racing.pawns.get(playerId)!;
    const player = gameState.room.players.get(playerId);
    const currentPitPosition = pawn.pitPosition || 1;

    const newPitPosition = currentPitPosition + diceResult;

    // Check if hitting pit-lane wall (position > 5)
    if (newPitPosition > 5) {
      console.log(`💥 ${player?.name} hits pit-lane wall, sent back to pit`);
      return {
        success: false,
        newPosition: 'pit',
        newLane: pawn.lane,
        newCoordinates: { x: 12.0, y: pawn.lane * 1.2 + 0.7 },
        coinsTriggered: [],
        lapCompleted: false,
        raceFinished: false,
        obstruction: {
          blockedBy: 'wall',
          finalPosition: 'pit'
        }
      };
    }

    // Stay in pit-lane
    console.log(`🚗 ${player?.name} moves to pit-lane space ${newPitPosition}`);

    return {
      success: true,
      newPosition: 'pit-lane',
      newLane: pawn.lane,
      newCoordinates: { x: 13.4174, y: newPitPosition * 0.5 },
      coinsTriggered: [],
      lapCompleted: false,
      raceFinished: false,
      pitPosition: newPitPosition
    };
  }

  private handleTrackMovement(gameState: GameState, playerId: string, moveSpaces: number): any {
    const racing = gameState.racing;
    if (!racing) return;
    const pawn = racing.pawns[playerId];
    if (!pawn) return;
    const player = gameState.room.players.get(playerId);

    const currentPos = pawn.currentPosition as number;
    let finalPosition = currentPos;
    let obstructionInfo: any = null;
    let lapCompleted = false;

    // Check each space one by one for obstructions
    for (let i = 1; i <= moveSpaces; i++) {
        let nextPos = (finalPosition % 96) + 1;

        // Check for lap completion
        if (finalPosition === 96 && nextPos === 1) {
            lapCompleted = true;
        }

        // Check for another pawn in the next space
        const obstructingPawn = Object.values(racing.pawns).find(
            (p: PawnState) => p.playerId !== playerId && p.currentPosition === nextPos && p.lane === pawn.lane
        );

        if (obstructingPawn) {
            console.log(`🚧 Movement for ${player?.name} obstructed at position ${nextPos} by ${gameState.room.players.get(obstructingPawn!.playerId)?.name}`);
            obstructionInfo = {
                blockedBy: 'pawn',
                finalPosition: finalPosition,
                finalLane: pawn.lane
            };
            break; // Stop movement
        }
        finalPosition = nextPos; // Move to the next space
    }

    const newPosition = finalPosition;
    let raceFinished = false;

    // Check for race finish
    if (lapCompleted && (pawn.lapNumber + 1 >= racing.lapTarget)) {
        raceFinished = true;
    }
    
    const coinsTriggered = this.getCoinsAtPosition(gameState, newPosition, pawn.lane);
    const newCoordinates = this.getTrackCoordinates(newPosition as TrackPosition, pawn.lane);
    
    console.log(`🏎️ ${player?.name} moves to position ${newPosition}, lane ${pawn.lane}`);
    
    return {
      success: true,
      newPosition,
      newLane: pawn.lane,
      newCoordinates,
      coinsTriggered,
      lapCompleted,
      raceFinished,
      obstruction: obstructionInfo
    };
  }

  private handleLaneChange(gameState: GameState, playerId: string, diceResult: string): any {
    const racing = gameState.racing;
    if (!racing) return;
    const pawn = racing.pawns[playerId];
    if (!pawn) return;
    const player = gameState.room.players.get(playerId);

    // Special handling for pit-lane
    if (pawn.currentPosition === 'pit-lane') {
      if (diceResult === 'R1' || diceResult === 'R2') {
        // Can merge back onto track
        const newLane = pawn.lane;
        const newPosition = 1; // Re-enter at position 1

        // Check for obstruction at re-entry point
        const isObstructed = Object.values(racing.pawns).some(
            (p: PawnState) => p.playerId !== playerId && p.currentPosition === newPosition && p.lane === newLane
        );

        if (isObstructed) {
          console.log(`❌ ${player?.name} cannot merge - track obstructed. Turn ends.`);
          return {
            success: false,
            reason: 'MERGE_BLOCKED',
            newPosition: pawn.currentPosition,
            newLane: pawn.lane,
            newCoordinates: pawn.coordinates,
            coinsTriggered: [],
            lapCompleted: false,
            raceFinished: false
          };
        }

        console.log(`🚗 ${player?.name} merges back onto track`);
        return {
          success: true,
          newPosition,
          newLane,
          newCoordinates: this.getTrackCoordinates(newPosition, newLane),
          coinsTriggered: this.getCoinsAtPosition(gameState, newPosition, newLane),
          lapCompleted: false,
          raceFinished: false
        };
      } else {
        console.log(`❌ ${player?.name} cannot merge with ${diceResult}. Turn ends.`);
        return {
          success: false,
          reason: 'INVALID_MERGE_ROLL',
          newPosition: pawn.currentPosition,
          newLane: pawn.lane,
          newCoordinates: pawn.coordinates,
          coinsTriggered: [],
          lapCompleted: false,
          raceFinished: false
        };
      }
    }

    // Regular lane change on track
    let desiredLaneChange = 0;
    if (diceResult === 'L1') desiredLaneChange = -1;
    else if (diceResult === 'R1') desiredLaneChange = 1;
    else if (diceResult === 'L2') desiredLaneChange = -2;
    else if (diceResult === 'R2') desiredLaneChange = 2;

    let finalLane = pawn.lane;
    let obstructionInfo = null;

    // Try to move the maximum amount, then less if blocked
    for (let i = Math.abs(desiredLaneChange); i > 0; i--) {
        const tryLane = (pawn.lane + (i * Math.sign(desiredLaneChange))) as Lane;

        if (tryLane < 1 || tryLane > 4) {
            obstructionInfo = { blockedBy: 'wall' };
            continue; // Hit a wall
        }

        const isObstructed = Object.values(racing.pawns).some(
            (p: PawnState) => p.playerId !== playerId && p.currentPosition === pawn.currentPosition && p.lane === tryLane
        );

        if (!isObstructed) {
            finalLane = tryLane;
            obstructionInfo = null; // Found a clear path
            break; // Found a valid lane
        } else {
            obstructionInfo = { blockedBy: 'pawn' };
        }
    }

    if (finalLane === pawn.lane) {
      console.log(`❌ ${player?.name} cannot change lanes (blocked)`);
    } else {
      console.log(`🚗 ${player?.name} changes from lane ${pawn.lane} to lane ${finalLane}`);
    }

    return {
      success: true,
      newPosition: pawn.currentPosition,
      newLane: finalLane,
      newCoordinates: this.getTrackCoordinates(pawn.currentPosition as TrackPosition, finalLane),
      coinsTriggered: this.getCoinsAtPosition(gameState, pawn.currentPosition as number, finalLane),
      lapCompleted: false,
      raceFinished: false,
      obstruction: obstructionInfo
    };
  }

  private getCoinsAtPosition(gameState: GameState, position: number, lane: Lane): any[] {
    const racing = gameState.racing;
    if (!racing) return [];
    const triggeredCoins = [];

    for (const [coinId, coin] of Object.entries(racing.coins)) {
      if (coin.position === position && coin.lane === lane && !coin.isRevealed) {
        coin.isRevealed = true;
        triggeredCoins.push(coin);
      }
    }

    return triggeredCoins;
  }

  private handleCoinTrigger(gameState: GameState, playerId: string, coin: any): void {
    const racing = (gameState as any).racing;
    const pawn = racing.pawns.get(playerId)!;
    const player = gameState.room.players.get(playerId);
    
    console.log(`🪙 ${player?.name} triggered coin: ${coin.value}`);
    
    switch (coin.value) {
      case '+2':
      case '+3':
      case '+4':
      case '+5':
        const forwardSpaces = parseInt(coin.value);
        const forwardMovement = this.handleTrackMovement(gameState, playerId, forwardSpaces);
        this.applyCoinMovement(gameState, playerId, forwardMovement);
        break;
        
      case '-2':
      case '-3':
      case '-4':
      case '-5':
        const backwardSpaces = -parseInt(coin.value);
        const backwardMovement = this.handleTrackMovement(gameState, playerId, backwardSpaces);
        this.applyCoinMovement(gameState, playerId, backwardMovement);
        break;
        
      case 'tow-to-pit':
        console.log(`🚛 ${player?.name} towed to pit`);
        pawn.currentPosition = 'pit';
        pawn.coordinates = { x: 12.0, y: pawn.lane * 1.2 + 0.7 };
        break;
    }
  }

  private applyCoinMovement(gameState: GameState, playerId: string, movementResult: any): void {
    const racing = (gameState as any).racing;
    const pawn = racing.pawns.get(playerId)!;
    
    pawn.currentPosition = movementResult.newPosition;
    pawn.lane = movementResult.newLane;
    pawn.coordinates = movementResult.newCoordinates;
    
    if (movementResult.lapCompleted) {
      pawn.lapNumber++;
    }
    
    // Chain reaction: check for more coins at new position
    if (movementResult.coinsTriggered.length > 0) {
      for (const chainCoin of movementResult.coinsTriggered) {
        this.handleCoinTrigger(gameState, playerId, chainCoin);
      }
    }
  }

  private checkRaceCompletion(gameState: GameState): void {
    const racing = (gameState as any).racing;
    const totalPlayers = gameState.room.players.size;
    
    // Race ends when first player finishes, but all players complete their turn
    if (racing.finishingOrder.length > 0) {
      racing.raceFinished = true;
      
      // Determine final standings based on position and lap
      const finalStandings = this.calculateFinalStandings(gameState);
      racing.finishingOrder = finalStandings;
      
      console.log('🏁 Race completed!');
      finalStandings.forEach((playerId, index) => {
        const player = gameState.room.players.get(playerId);
        console.log(`${index + 1}. ${player?.name}`);
      });
    }
  }

  private calculateFinalStandings(gameState: GameState): string[] {
    const racing = (gameState as any).racing;
    const players = Array.from(gameState.room.players.keys());
    
    // Sort by: laps completed (desc), then position (desc)
    return players.sort((a, b) => {
      const pawnA = racing.pawns.get(a)!;
      const pawnB = racing.pawns.get(b)!;
      
      // First by lap number
      if (pawnA.lapNumber !== pawnB.lapNumber) {
        return pawnB.lapNumber - pawnA.lapNumber;
      }
      
      // Then by position (if on track)
      const posA = typeof pawnA.currentPosition === 'number' ? pawnA.currentPosition : 0;
      const posB = typeof pawnB.currentPosition === 'number' ? pawnB.currentPosition : 0;
      
      return posB - posA;
    });
  }

  private advanceToNextRacingPlayer(gameState: GameState): void {
    const racing = gameState.racing;
    if (!racing) return;

    if (racing.raceFinished) {
      return; // No more turns after race is finished
    }
    
    const playerIds = Array.from(gameState.room.players.keys());
    const currentIndex = playerIds.indexOf(racing.currentRacingPlayer);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    
    racing.currentRacingPlayer = playerIds[nextIndex];
    
    const nextPlayer = gameState.room.players.get(racing.currentRacingPlayer);
    console.log(`📍 Next racing player: ${nextPlayer?.name}`);
  }

  // Helper methods for stage advancement
  private advanceToNextSelector(gameState: GameState): void {
    const dealerSelection = gameState.dealerSelection;
    if (!dealerSelection) return;

    const playersInSeatOrder = Array.from(gameState.room.players.values()).sort(
      (a, b) => a.roomSlot - b.roomSlot
    );

    const playersToSelect =
      dealerSelection.tieBreakerPlayers && dealerSelection.tieBreakerPlayers.length > 0
        ? playersInSeatOrder.filter((p) => dealerSelection.tieBreakerPlayers?.includes(p.id))
        : playersInSeatOrder;

    const currentIndex = playersToSelect.findIndex((p) => p.id === dealerSelection.currentSelectingPlayerId);

    // Find next player who hasn't selected a card yet
    for (let i = 1; i <= playersToSelect.length; i++) {
      const nextIndex = (currentIndex + i) % playersToSelect.length;
      const nextPlayer = playersToSelect[nextIndex];

      if (!(nextPlayer.id in dealerSelection.selectedCards)) {
        dealerSelection.currentSelectingPlayerId = nextPlayer.id;
        console.log(`📍 Next player to select: ${nextPlayer.name}`);
        return;
      }
    }

    // All players (in the current round) have selected cards
    console.log('✅ All players in the current selection round have selected cards');
  }

  private advanceToNextLaneSelector(gameState: GameState): void {
    const laneSelection = (gameState as any).laneSelection;
    if (!laneSelection) return;

    const stormOrder = gameState.stormWinningOrder;
    const currentIndex = stormOrder.indexOf(laneSelection.currentSelector);
    
    // Find next player who hasn't selected a lane yet
    for (let i = 1; i <= stormOrder.length; i++) {
      const nextIndex = (currentIndex + i) % stormOrder.length;
      const nextPlayer = stormOrder[nextIndex];
      
      if (!laneSelection.selectedLanes.has(nextPlayer)) {
        laneSelection.currentSelector = nextPlayer;
        const player = gameState.room.players.get(nextPlayer);
        console.log(`📍 Next lane selector: ${player?.name}`);
        return;
      }
    }
    
    // All players have selected lanes
    laneSelection.allLanesSelected = true;
    console.log('✅ All players have selected lanes');
  }

  private advanceToNextCoinPlacer(gameState: GameState): void {
    const coinStage = (gameState as any).coinStage;
    if (!coinStage) return;

    const stormOrder = gameState.stormWinningOrder;
    const currentIndex = stormOrder.indexOf(coinStage.currentPlacer);
    
    // Find next player who still has coins to place
    for (let i = 1; i <= stormOrder.length; i++) {
      const nextIndex = (currentIndex + i) % stormOrder.length;
      const nextPlayer = stormOrder[nextIndex];
      const playerCoins = coinStage.drawnCoins.get(nextPlayer) || [];
      
      if (playerCoins.length > 0) {
        coinStage.currentPlacer = nextPlayer;
        const player = gameState.room.players.get(nextPlayer);
        console.log(`📍 Next coin placer: ${player?.name}`);
        return;
      }
    }
    
    // All players have placed all their coins
    coinStage.allCoinsPlaced = true;
    console.log('✅ All players have placed their coins');
  }

  private checkDealerSelectionResult(gameState: GameState): void {
    const dealerSelection = gameState.dealerSelection;
    if (!dealerSelection) {
      console.error('No dealer selection state found');
      return;
    }

    const playersToConsider =
      dealerSelection.tieBreakerPlayers && dealerSelection.tieBreakerPlayers.length > 0
        ? dealerSelection.tieBreakerPlayers
        : Array.from(gameState.room.players.keys());

    const selectedCards = dealerSelection.selectedCards;

    // Wait until all players who need to select have done so.
    const allPlayersSelected = playersToConsider.every((playerId) => playerId in selectedCards);
    if (!allPlayersSelected) {
      const selectedCount = playersToConsider.filter((p) => p in selectedCards).length;
      console.log(`⏳ Waiting for more players to select cards (${selectedCount}/${playersToConsider.length})`);
      return;
    }

    const playerCards: Array<{ playerId: string; card: Card; value: number }> = [];

    // Get card values for all players who are part of the current selection round
    for (const playerId of playersToConsider) {
      const card = selectedCards[playerId];
      if (card) {
        const value = CardDeck.getCardValue(card);
        playerCards.push({ playerId, card, value });
      }
    }

    // Sort by card value (LOWEST first for dealer selection)
    playerCards.sort((a, b) => a.value - b.value);

    if (playerCards.length === 0) {
      console.log('No cards to compare for dealer selection.');
      return;
    }

    const lowestValue = playerCards[0]?.value;
    const tiedPlayers = playerCards.filter((pc) => pc.value === lowestValue);

    if (tiedPlayers.length === 1) {
      // Clear winner (lowest card)
      const dealerId = tiedPlayers[0].playerId;
      dealerSelection.dealerId = dealerId;
      gameState.dealerButton = dealerId; // Also set the cross-stage dealer button
      dealerSelection.isComplete = true;
      dealerSelection.tieBreakerPlayers = []; // Clear any previous tie-breaker state

      const dealer = gameState.room.players.get(dealerId);
      console.log(
        `🏆 Dealer determined: ${dealer?.name} with ${tiedPlayers[0].card.rank} of ${tiedPlayers[0].card.suit} (lowest card)`
      );
    } else {
      // Handle tie - need another round
      const tiedPlayerIds = tiedPlayers.map((p) => p.playerId);
      dealerSelection.tieBreakerPlayers = tiedPlayerIds;
      console.log(`🔄 Tie detected between ${tiedPlayers.length} players - dealing again`);
      this.handleDealerSelectionTie(gameState);
    }
  }

  private handleDealerSelectionTie(gameState: GameState): void {
    const dealerSelection = gameState.dealerSelection;
    if (!dealerSelection) return;

    const tiedPlayerIds = dealerSelection.tieBreakerPlayers;
    if (!tiedPlayerIds || tiedPlayerIds.length === 0) {
      console.error('handleDealerSelectionTie called without any tied players.');
      return;
    }

    console.log('🎴 Breaking tie between players...');

    // Reset the grid with new 18 cards
    const newDealerCards = this.deck.dealDealerSelectionCards();
    newDealerCards.forEach((card, index) => {
      const row = Math.floor(index / 6);
      const col = index % 6;
      (card as any).position = { x: col, y: row };
      (card as any).isFlipped = false;
    });

    // Clear selected cards for tied players so they can select again
    for (const playerId of tiedPlayerIds) {
      delete dealerSelection.selectedCards[playerId];
    }

    // Update state for new selection round
    dealerSelection.dealerCards = newDealerCards;

    // Set first tied player as current selector (in seat order)
    const players = Array.from(gameState.room.players.values()).sort((a, b) => a.roomSlot - b.roomSlot);

    const firstTiedPlayer = players.find((p) => tiedPlayerIds.includes(p.id));

    if (firstTiedPlayer) {
      dealerSelection.currentSelectingPlayerId = firstTiedPlayer.id;
      console.log(`🔄 Tie-breaking round starts with: ${firstTiedPlayer.name}`);
    } else {
      console.error('Could not find a valid player to start the tie-break round.');
      // As a fallback, pick the first from the list.
      dealerSelection.currentSelectingPlayerId = tiedPlayerIds[0];
    }
  }

  /**
   * Determine the first player for Storm stage
   */
  private determineFirstPlayer(gameState: GameState, initialCard: Card): string {
    const playerIds = Array.from(gameState.room.players.keys());
    const dealerIndex = playerIds.indexOf(gameState.dealerButton || playerIds[0]);
    
    // First player is clockwise from dealer
    let firstPlayerIndex = (dealerIndex + 1) % playerIds.length;
    
    // If initial card is Ace, skip the first player
    if (initialCard.rank === 'A') {
      firstPlayerIndex = (firstPlayerIndex + 1) % playerIds.length;
      console.log('🃑 Initial Ace: First player skipped');
    }
    
    return playerIds[firstPlayerIndex];
  }

  /**
   * Determine initial suit based on initial card
   */
  private determineInitialSuit(initialCard: Card): 'hearts' | 'diamonds' | 'spades' | 'clubs' | undefined {
    if (initialCard.rank === 'Q') {
      // Queen as first card calls the suit of the bottom card in deck
      const bottomCard = this.deck.getBottomCard();
      console.log(`👸 Initial Queen calls suit: ${bottomCard?.suit || 'hearts'}`);
      return bottomCard?.suit || 'hearts';
    }
    return undefined; // No suit called
  }
}
