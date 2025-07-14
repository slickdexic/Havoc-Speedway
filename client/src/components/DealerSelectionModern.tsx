// =================== PROFESSIONAL DEALER SELECTION ===================
// Modern, industry-standard dealer selection component with professional game logic

import React, { useState, useEffect, useCallback } from 'react';
import { Player } from '../../../shared/src/types/game';
import { Card } from '../../../shared/src/types/cards';
import { ClientDealerSelectionState } from '../../../shared/src/types/client';
import GameEngine, { GameStateUtils } from '../utils/GameEngine';
import '../styles/modern-design-system.css';
import '../styles/dealer-selection.css';

interface DealerSelectionProps {
  players: Player[];
  dealerSelection: ClientDealerSelectionState;
  currentPlayerId: string;
  onCardSelect: (cardId: string) => void;
  onGameEvent?: (event: string, data: any) => void;
}

interface CardDisplayProps {
  card: Card;
  position: number;
  isSelectable: boolean;
  isSelected: boolean;
  onSelect: (cardId: string) => void;
}

/**
 * Modern Card Component - Professional card rendering with animations
 */
const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  position,
  isSelectable,
  isSelected,
  onSelect
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleClick = useCallback(() => {
    if (!isSelectable || isFlipping) return;
    
    setIsFlipping(true);
    setTimeout(() => {
      onSelect(card.id);
      setIsFlipping(false);
    }, 150);
  }, [isSelectable, isFlipping, onSelect, card.id]);

  const cardClasses = [
    'dealer-card',
    card.isFlipped ? 'flipped' : 'face-down',
    isSelectable ? 'selectable' : 'disabled',
    isSelected ? 'selected' : '',
    isHovered ? 'hovered' : '',
    isFlipping ? 'flipping' : ''
  ].filter(Boolean).join(' ');

  const getSuitColor = (suit: string): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
  };

  const getSuitSymbol = (suit: string): string => {
    const symbols: Record<string, string> = {
      hearts: '♥',
      diamonds: '♦',
      spades: '♠',
      clubs: '♣'
    };
    return symbols[suit] || '?';
  };

  return (
    <div
      className={cardClasses}
      style={{
        '--card-delay': `${position * 50}ms`,
        '--suit-color': getSuitColor(card.suit)
      } as React.CSSProperties}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={isSelectable ? 0 : -1}
      aria-label={
        card.isFlipped 
          ? `${card.rank} of ${card.suit}`
          : `Hidden card ${position + 1}`
      }
      aria-pressed={isSelected}
      aria-disabled={!isSelectable}
    >
      <div className="card-inner">
        {/* Face-down side */}
        <div className="card-back">
          <div className="card-back-pattern">
            <div className="havoc-logo">H</div>
            <div className="speedway-text">SPEEDWAY</div>
          </div>
        </div>
        
        {/* Face-up side */}
        <div className="card-front">
          <div className="card-content">
            <div className="card-rank-top">
              <span className="rank">{card.rank}</span>
              <span className="suit">{getSuitSymbol(card.suit)}</span>
            </div>
            
            <div className="card-center">
              <span className="suit-large">{getSuitSymbol(card.suit)}</span>
            </div>
            
            <div className="card-rank-bottom">
              <span className="rank">{card.rank}</span>
              <span className="suit">{getSuitSymbol(card.suit)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="selection-indicator">
          <div className="selection-ring"></div>
          <div className="selection-checkmark">✓</div>
        </div>
      )}
    </div>
  );
};

/**
 * Professional Player Status Component
 */
interface PlayerStatusProps {
  player: Player;
  isCurrentPlayer: boolean;
  selectedCard?: Card;
  hasSelectedCard: boolean;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({
  player,
  isCurrentPlayer,
  selectedCard,
  hasSelectedCard
}) => {
  const playerInfo = GameStateUtils.getPlayerDisplayInfo(player);
  
  const statusClasses = [
    'player-status',
    isCurrentPlayer ? 'current-turn' : '',
    hasSelectedCard ? 'has-selected' : 'waiting'
  ].filter(Boolean).join(' ');

  return (
    <div className={statusClasses}>
      <div className="player-info">
        <div 
          className="player-pawn"
          style={{ backgroundColor: playerInfo.pawnColor }}
        >
          <span className="pawn-icon">🏎️</span>
        </div>
        
        <div className="player-details">
          <h3 className="player-name">{playerInfo.displayName}</h3>
          <div className="player-meta">
            <span className="room-slot">Slot {player.roomSlot}</span>
            {player.isHost && <span className="host-badge">HOST</span>}
          </div>
        </div>
      </div>
      
      <div className="selection-status">
        {hasSelectedCard ? (
          <div className="selected-card-preview">
            {selectedCard && (
              <div className="mini-card">
                <span className="mini-rank">{selectedCard.rank}</span>
                <span className="mini-suit">
                  {selectedCard.suit === 'hearts' || selectedCard.suit === 'diamonds' ? 
                    (selectedCard.suit === 'hearts' ? '♥' : '♦') :
                    (selectedCard.suit === 'spades' ? '♠' : '♣')
                  }
                </span>
              </div>
            )}
            <span className="status-text">Selected</span>
          </div>
        ) : isCurrentPlayer ? (
          <div className="turn-indicator">
            <div className="pulse-dot"></div>
            <span className="status-text">Your Turn</span>
          </div>
        ) : (
          <div className="waiting-indicator">
            <span className="status-text">Waiting</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Professional Main Component - Dealer Selection
 */
const DealerSelectionModern: React.FC<DealerSelectionProps> = ({
  players,
  dealerSelection,
  currentPlayerId,
  onCardSelect,
  onGameEvent
}) => {
  const [gameEngine] = useState(() => {
    const mockGameState = {
      roomId: 'test',
      roomName: 'Test Room',
      stage: 'dealer-selection' as const,
      players,
      roundNumber: 1,
      stormWinningOrder: [],
      settings: {
        numberOfLaps: 3 as const,
        numberOfDice: 2 as const,
        numberOfDecks: 1 as const,
        cardsPerHand: 4 as const,
        numberOfCoins: 2 as const
      },
      dealerSelection
    };
    return new GameEngine(mockGameState);
  });

  const [selectedCards, setSelectedCards] = useState<Record<string, string>>({});
  const [currentTurn, setCurrentTurn] = useState(dealerSelection.currentSelectingPlayerId);

  useEffect(() => {
    setCurrentTurn(dealerSelection.currentSelectingPlayerId);
    setSelectedCards(
      Object.fromEntries(
        Object.entries(dealerSelection.selectedCards).map(([playerId, card]) => [playerId, card.id])
      )
    );
  }, [dealerSelection]);

  // Event handling
  useEffect(() => {
    const handleCardSelected = (data: any) => {
      if (onGameEvent) {
        onGameEvent('cardSelected', data);
      }
    };

    const handleDealerSelected = (data: any) => {
      if (onGameEvent) {
        onGameEvent('dealerSelected', data);
      }
    };

    const handleTieBreaker = (data: any) => {
      if (onGameEvent) {
        onGameEvent('tieBreakerStarted', data);
      }
    };

    gameEngine.addEventListener('cardSelected', handleCardSelected);
    gameEngine.addEventListener('dealerSelected', handleDealerSelected);
    gameEngine.addEventListener('tieBreakerStarted', handleTieBreaker);

    return () => {
      gameEngine.removeEventListener('cardSelected', handleCardSelected);
      gameEngine.removeEventListener('dealerSelected', handleDealerSelected);
      gameEngine.removeEventListener('tieBreakerStarted', handleTieBreaker);
    };
  }, [gameEngine, onGameEvent]);

  const handleCardClick = useCallback((cardId: string) => {
    const validation = gameEngine.canSelectCard(currentPlayerId, cardId);
    
    if (!validation.canSelect) {
      console.warn('Cannot select card:', validation.reason);
      return;
    }

    // Trigger the parent callback immediately for UI responsiveness
    onCardSelect(cardId);
  }, [gameEngine, currentPlayerId, onCardSelect]);

  const isMyTurn = currentTurn === currentPlayerId;
  const turnPlayer = players.find(p => p.id === currentTurn);

  // Organize cards in 3x6 grid
  const cardGrid = Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => {
      const index = row * 6 + col;
      return dealerSelection.dealerCards[index];
    })
  );

  return (
    <div className="dealer-selection-stage">
      {/* Professional Header */}
      <header className="stage-header">
        <div className="header-content">
          <div className="stage-info">
            <h1 className="stage-title">Dealer Selection</h1>
            <p className="stage-description">
              Each player selects a hidden card. Highest card wins and becomes the dealer.
            </p>
          </div>
          
          <div className="round-info">
            {dealerSelection.tieBreakerPlayers.length > 0 && (
              <div className="tie-breaker-notice">
                <span className="tie-icon">🔥</span>
                <span>Tie-Breaker Round</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Professional Player Status Row */}
      <section className="players-status" aria-label="Player Status">
        <div className="players-grid">
          {players.map(player => (
            <PlayerStatus
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === currentTurn}
              selectedCard={dealerSelection.selectedCards[player.id]}
              hasSelectedCard={!!dealerSelection.selectedCards[player.id]}
            />
          ))}
        </div>
      </section>

      {/* Professional Turn Indicator */}
      <section className="turn-indicator-section">
        <div className="turn-info">
          {dealerSelection.isComplete ? (
            <div className="completion-notice">
              <h2>🏁 Dealer Selection Complete!</h2>
              {dealerSelection.dealerId && (
                <p>
                  <strong>{players.find(p => p.id === dealerSelection.dealerId)?.name}</strong> is the dealer
                </p>
              )}
            </div>
          ) : isMyTurn ? (
            <div className="my-turn-notice">
              <h2>🎯 Your Turn</h2>
              <p>Select a card from the grid below</p>
            </div>
          ) : (
            <div className="waiting-notice">
              <h2>⏳ Waiting for {turnPlayer?.name}</h2>
              <p>They are selecting their card...</p>
            </div>
          )}
        </div>
      </section>

      {/* Professional Card Grid */}
      <section className="card-selection-area" aria-label="Card Selection Grid">
        <div className="card-grid">
          {cardGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="card-row">
              {row.map((card, colIndex) => {
                if (!card) return <div key={colIndex} className="card-placeholder" />;
                
                const position = rowIndex * 6 + colIndex;
                const isSelectable = isMyTurn && !card.isFlipped && !dealerSelection.selectedCards[currentPlayerId];
                const isSelected = selectedCards[currentPlayerId] === card.id;
                
                return (
                  <CardDisplay
                    key={card.id}
                    card={card}
                    position={position}
                    isSelectable={isSelectable}
                    isSelected={isSelected}
                    onSelect={handleCardClick}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* Professional Game Progress */}
      <footer className="game-progress">
        <div className="progress-info">
          <div className="selection-progress">
            <span className="progress-text">
              {Object.keys(dealerSelection.selectedCards).length} / {players.length} players selected
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(Object.keys(dealerSelection.selectedCards).length / players.length) * 100}%` 
                }}
              />
            </div>
          </div>
          
          {dealerSelection.tieBreakerPlayers.length > 0 && (
            <div className="tie-info">
              <span>Tie-breaker between: {
                dealerSelection.tieBreakerPlayers
                  .map(id => players.find(p => p.id === id)?.name)
                  .join(', ')
              }</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default DealerSelectionModern;
