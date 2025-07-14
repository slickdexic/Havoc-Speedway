import React from 'react';
import type { DealerSelectionState } from '../../../shared/src/types/cards';
import type { Player } from '../../../shared/src/types/game';
import '../styles/professional-dealer-selection.css';

interface ProfessionalDealerSelectionProps {
  dealerState: DealerSelectionState;
  currentPlayer: Player;
  onGameAction: (action: any) => void;
}

const ProfessionalDealerSelection: React.FC<ProfessionalDealerSelectionProps> = ({
  dealerState,
  currentPlayer,
  onGameAction
}) => {
  const handleCardClick = (cardId: string) => {
    if (dealerState.currentSelectingPlayerId === currentPlayer.id) {
      onGameAction({
        type: 'SELECT_DEALER_CARD',
        playerId: currentPlayer.id,
        cardId: cardId
      });
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

  const isMyTurn = dealerState.currentSelectingPlayerId === currentPlayer.id;
  const isCardSelectable = (card: any) => {
    return isMyTurn && !card.isFlipped && !dealerState.selectedCards[currentPlayer.id];
  };

  if (dealerState.isComplete && dealerState.dealerId) {
    // Show dealer reveal with celebration
    return (
      <div className="professional-dealer-selection">
        <div className="casino-atmosphere">
          <div className="velvet-background"></div>
          <div className="gold-frame">
            
            <div className="stage-header-luxury">
              <div className="crown-icon">👑</div>
              <h1 className="luxury-title">Dealer Selected!</h1>
              <p className="luxury-subtitle">The cards have chosen their master</p>
            </div>

            <div className="dealer-revealed">
              <div className="celebration-banner">
                <div className="dealer-announcement">
                  🎉 Congratulations! 🎉
                </div>
                
                <div className="winner-display">
                  <div className="dealer-crown">👑</div>
                  <div className="dealer-name">
                    Player {dealerState.dealerId}
                  </div>
                  <div className="dealer-description">
                    Master of the Cards
                  </div>
                </div>

                <div className="transition-notice">
                  <div className="loading-dots">
                    <span>•</span>
                    <span>•</span>
                    <span>•</span>
                  </div>
                  <p>Preparing for the Storm Stage...</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (!dealerState.dealerCards || dealerState.dealerCards.length === 0) {
    // Loading state
    return (
      <div className="professional-dealer-selection">
        <div className="casino-atmosphere">
          <div className="velvet-background"></div>
          <div className="gold-frame">
            
            <div className="stage-header-luxury">
              <div className="crown-icon">👑</div>
              <h1 className="luxury-title">Dealer Selection</h1>
              <p className="luxury-subtitle">Preparing the sacred cards...</p>
            </div>

            <div className="loading-casino">
              <div className="poker-chips">
                <div className="chip red-chip"></div>
                <div className="chip blue-chip"></div>
                <div className="chip green-chip"></div>
              </div>
              <div className="casino-text">
                Shuffling the deck of destiny...
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Main dealer selection interface
  return (
    <div className="professional-dealer-selection">
      <div className="casino-atmosphere">
        <div className="velvet-background"></div>
        <div className="gold-frame">
          
          <div className="stage-header-luxury">
            <div className="crown-icon">👑</div>
            <h1 className="luxury-title">Dealer Selection</h1>
            <p className="luxury-subtitle">Choose your card wisely</p>
          </div>

          <div className="casino-turn-indicator">
            <div className="turn-spotlight">
              <div className="spotlight-effect"></div>
              <div className="turn-content">
                {isMyTurn ? (
                  <>
                    <div className="your-turn-text">Your Turn</div>
                    <div className="instruction-text">Select any card to reveal your fate</div>
                  </>
                ) : (
                  <div className="waiting-elegance">
                    <div className="hourglass-icon">⏳</div>
                    <div className="waiting-text">
                      Waiting for <span className="player-highlight">Player {dealerState.currentSelectingPlayerId}</span> to choose
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="luxury-card-table">
            <div className="table-felt"></div>
            <div className="professional-card-grid">
              {dealerState.dealerCards.map((card) => (
                <div
                  key={card.id}
                  className={`luxury-card ${
                    isCardSelectable(card) ? 'selectable' : ''
                  } ${card.isFlipped ? 'revealed' : ''} ${
                    !isMyTurn && !card.isFlipped ? 'locked' : ''
                  }`}
                  onClick={() => handleCardClick(card.id)}
                >
                  {isCardSelectable(card) && (
                    <div className="selection-glow"></div>
                  )}
                  
                  {card.isFlipped ? (
                    // Revealed card
                    <div className="card-revealed">
                      <div className="card-border">
                        <div className="card-content">
                          <div className={`card-rank-large ${getSuitColor(card.suit)}`}>
                            {card.rank}
                          </div>
                          <div className={`card-suit-large ${getSuitColor(card.suit)}`}>
                            {getSuitSymbol(card.suit)}
                          </div>
                        </div>
                        <div className="card-corners">
                          <div className={`corner top-left ${getSuitColor(card.suit)}`}>
                            <div className="mini-rank">{card.rank}</div>
                            <div className="mini-suit">{getSuitSymbol(card.suit)}</div>
                          </div>
                          <div className={`corner bottom-right rotated ${getSuitColor(card.suit)}`}>
                            <div className="mini-rank">{card.rank}</div>
                            <div className="mini-suit">{getSuitSymbol(card.suit)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Face-down card
                    <div className="card-back-luxury">
                      <div className="card-back-pattern">
                        <div className="back-design">
                          <div className="ornate-border"></div>
                          <div className="center-emblem">⚜</div>
                          <div className="corner-flourishes">
                            <div className="flourish top-left">❋</div>
                            <div className="flourish top-right">❋</div>
                            <div className="flourish bottom-left">❋</div>
                            <div className="flourish bottom-right">❋</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfessionalDealerSelection;
