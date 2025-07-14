import React from 'react';
import type { ClientDealerSelectionState } from '../../../shared/src/types/client';
import type { Player } from '../../../shared/src/types/game';
import '../styles/dealer-selection.css';

interface DealerSelectionProps {
  dealerState: ClientDealerSelectionState;
  currentPlayer: Player;
  players: Player[];
  onGameAction: (action: any) => void;
}

const DealerSelection: React.FC<DealerSelectionProps> = ({
  dealerState,
  currentPlayer,
  players,
  onGameAction
}) => {
  const handleCardClick = (cardId: string) => {
    console.log('🎴 Card clicked:', cardId);
    console.log('🎴 Current player:', currentPlayer.id);
    console.log('🎴 Current selecting player:', dealerState.currentSelectingPlayerId);
    console.log('🎴 Is my turn?:', dealerState.currentSelectingPlayerId === currentPlayer.id);
    
    // Check if it's my turn and I haven't selected a card yet
    const isMyTurn = dealerState.currentSelectingPlayerId === currentPlayer.id;
    const hasAlreadySelected = !!dealerState.selectedCards[currentPlayer.id];
    
    if (isMyTurn && !hasAlreadySelected) {
      console.log('🎴 Sending SELECT_DEALER_CARD action');
      onGameAction({
        type: 'SELECT_DEALER_CARD',
        playerId: currentPlayer.id,
        cardId: cardId
      });
    } else {
      console.log('🎴 Cannot select card - Not my turn or already selected');
    }
  };

  const getSuitColor = (suit: string) => {
    return (suit === 'hearts' || suit === 'diamonds') ? 'red-suit' : 'black-suit';
  };

  const getSuitSymbol = (suit: string) => {
    const symbols = {
      hearts: '♥',
      diamonds: '♦',
      spades: '♠',
      clubs: '♣'
    };
    return symbols[suit as keyof typeof symbols] || '?';
  };

  const getPawnColor = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    const colors = {
      red: '#ef4444',
      blue: '#3b82f6', 
      green: '#22c55e',
      yellow: '#eab308',
      purple: '#a855f7',
      orange: '#f97316'
    };
    return colors[player?.color as keyof typeof colors] || '#6b7280';
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Unknown';
  };

  const isMyTurn = dealerState.currentSelectingPlayerId === currentPlayer.id;
  const hasAlreadySelected = !!dealerState.selectedCards[currentPlayer.id];
  
  const isCardSelectable = (card: any) => {
    // Card is selectable if it's my turn, card is not flipped, and I haven't selected a card yet
    return isMyTurn && !card.isFlipped && !hasAlreadySelected;
  };

  // Dealer selection complete - show result
  if (dealerState.isComplete && dealerState.dealerId) {
    const dealerPlayer = players.find(p => p.id === dealerState.dealerId);
    return (
      <div className="dealer-selection">
        <div className="dealer-complete">
          <h2>🎭 Dealer Selected!</h2>
          <div className="dealer-announcement">
            <div className="dealer-crown">👑</div>
            <h3>{dealerPlayer?.name || 'Unknown'} is the Dealer</h3>
            <div 
              className="dealer-pawn" 
              style={{ color: getPawnColor(dealerState.dealerId) }}
            >
              🚗
            </div>
          </div>
          <p>🌪️ Advancing to Storm Stage...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!dealerState.dealerCards || dealerState.dealerCards.length === 0) {
    return (
      <div className="dealer-selection">
        <div className="loading-state">
          <h2>🎴 Preparing Dealer Selection...</h2>
          <p>Shuffling cards...</p>
        </div>
      </div>
    );
  }

  // Main dealer selection interface
  return (
    <div className="dealer-selection">
      {/* Top Section: Player Cards as per design reference */}
      <div className="player-cards-row">
        {players.map(player => {
          const isCurrentSelector = dealerState.currentSelectingPlayerId === player.id;
          const hasSelected = !!dealerState.selectedCards[player.id];
          const selectedCard = dealerState.selectedCards[player.id];
          
          return (
            <div 
              key={player.id} 
              className={`player-card ${isCurrentSelector ? 'active-turn' : ''} ${hasSelected ? 'completed' : ''}`}
            >
              <div className="player-name">{player.name}</div>
              <div 
                className="player-pawn" 
                style={{ color: getPawnColor(player.id) }}
              >
                🚗
              </div>
              
              {/* Selected card display in dealer button area */}
              {hasSelected && selectedCard && (
                <div className="dealer-button-area">
                  <div className="selected-card-mini">
                    <div className={`card-rank ${getSuitColor(selectedCard.suit)}`}>
                      {selectedCard.rank}
                    </div>
                    <div className={`card-suit ${getSuitColor(selectedCard.suit)}`}>
                      {getSuitSymbol(selectedCard.suit)}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Turn indicator */}
              {isCurrentSelector && !hasSelected && (
                <div className="turn-indicator">
                  <div className="selecting-text">Selecting...</div>
                  <div className="pulse-dot"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current turn announcement */}
      <div className="turn-status">
        {isMyTurn && !hasAlreadySelected ? (
          <h3 className="my-turn-text">🎯 Your Turn - Click any face-down card below</h3>
        ) : hasAlreadySelected ? (
          <h3 className="waiting-text">✅ Card selected - Waiting for other players</h3>
        ) : (
          <h3 className="waiting-text">⏳ Waiting for {getPlayerName(dealerState.currentSelectingPlayerId)} to select</h3>
        )}
      </div>

      {/* Card Grid: 3 rows × 6 columns = 18 cards */}
      <div className="card-selection-area">
        <div className="cards-grid">
          {Array.from({ length: 3 }, (_, rowIndex) => (
            <div key={rowIndex} className="card-row">
              {dealerState.dealerCards
                .slice(rowIndex * 6, (rowIndex + 1) * 6)
                .map((card) => {
                  const isSelectable = isCardSelectable(card);
                  const isRevealed = card.isFlipped;
                  
                  return (
                    <div
                      key={card.id}
                      className={`
                        dealer-card 
                        ${isSelectable ? 'selectable' : ''} 
                        ${isRevealed ? 'revealed' : 'face-down'}
                      `}
                      onClick={() => isSelectable && handleCardClick(card.id)}
                    >
                      {isRevealed ? (
                        // Revealed card
                        <div className="card-face">
                          <div className="card-corner top-left">
                            <div className={`rank ${getSuitColor(card.suit)}`}>{card.rank}</div>
                            <div className={`suit ${getSuitColor(card.suit)}`}>{getSuitSymbol(card.suit)}</div>
                          </div>
                          <div className="card-center">
                            <div className={`center-suit ${getSuitColor(card.suit)}`}>
                              {getSuitSymbol(card.suit)}
                            </div>
                          </div>
                          <div className="card-corner bottom-right">
                            <div className={`rank ${getSuitColor(card.suit)}`}>{card.rank}</div>
                            <div className={`suit ${getSuitColor(card.suit)}`}>{getSuitSymbol(card.suit)}</div>
                          </div>
                        </div>
                      ) : (
                        // Face-down card
                        <div className="card-back">
                          <div className="card-pattern">
                            <div className="pattern-lines"></div>
                            <div className="pattern-center">🂠</div>
                            <div className="pattern-lines"></div>
                          </div>
                          {isSelectable && (
                            <div className="hover-glow"></div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
        
        {/* Brief instructions */}
        <div className="instructions">
          <p><strong>Lowest card becomes dealer:</strong> 7 (low) → 8 → 9 → 10 → J → Q → K → A (high)</p>
        </div>
      </div>
    </div>
  );
};

export default DealerSelection;
