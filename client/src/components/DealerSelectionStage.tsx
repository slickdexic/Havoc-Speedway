import { GameState, Player } from '@havoc-speedway/shared';
import { GameSounds } from '../utils/SoundManager';

interface DealerSelectionStageProps {
  gameState: GameState;
  currentPlayerId: string;
  onPlayerAction: (action: any) => void;
}

function getSuitSymbol(suit: string): string {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '♠';
  }
}

export function DealerSelectionStage({ gameState, currentPlayerId, onPlayerAction }: DealerSelectionStageProps) {
  const dealerSelection = (gameState as any).dealerSelection;
  
  if (!dealerSelection) {
    return (
      <div className="dealer-selection-stage-new">
        <div className="casino-background">
          <div className="casino-lights"></div>
        </div>
        <div className="stage-header-new">
          <div className="stage-icon">🎰</div>
          <h1 className="stage-title-new">Dealer Selection</h1>
          <p className="stage-subtitle-new">Determining who holds the deck...</p>
        </div>
        <div className="loading-container-new">
          <div className="casino-chips">
            <div className="chip red"></div>
            <div className="chip blue"></div>
            <div className="chip green"></div>
          </div>
          <p className="loading-text-new">Shuffling the deck...</p>
        </div>
      </div>
    );
  }

  const handleCardClick = (cardId: string) => {
    GameSounds.cardSelect();
    onPlayerAction({
      type: 'SELECT_DEALER_CARD',
      playerId: currentPlayerId,
      cardId
    });
  };

  const isCurrentPlayersTurn = dealerSelection.currentSelectingPlayerId === currentPlayerId;
  const isComplete = dealerSelection.isComplete;
  const players = Array.from(gameState.room.players.values());
  const currentTurnPlayer = players.find((p: Player) => p.id === dealerSelection.currentSelectingPlayerId);

  return (
    <div className="dealer-selection-stage-new">
      <div className="casino-background">
        <div className="casino-lights"></div>
        <div className="casino-pattern"></div>
      </div>

      {isComplete ? (
        <div className="dealer-determined-new">
          <div className="winner-spotlight"></div>
          <div className="crown-icon">👑</div>
          <h2 className="winner-title">Dealer Crowned!</h2>
          <div className="winner-name">
            {players.find((p: Player) => p.id === dealerSelection.dealerId)?.name}
          </div>
          <p className="winner-subtitle">Drew the lowest card and claims the dealer position</p>
          <div className="transition-message">
            <div className="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <p>Advancing to Storm Stage...</p>
          </div>
        </div>
      ) : (
        <div className="dealer-selection-content-new">
          {/* Elegant Header */}
          <div className="game-header-new">
            <div className="casino-emblem">♠️</div>
            <h1 className="game-title-new">Dealer Selection</h1>
            <p className="game-description-new">Each player draws a card to determine the dealer</p>
          </div>

          {/* Player Status Bar */}
          <div className="player-status-bar">
            {players.map((player: Player) => {
              const hasSelected = dealerSelection.selectedCards && (player.id in dealerSelection.selectedCards);
              const isCurrentPlayer = player.id === dealerSelection.currentSelectingPlayerId;
              
              return (
                <div key={player.id} className={`player-status ${isCurrentPlayer ? 'current' : ''} ${hasSelected ? 'completed' : ''}`}>
                  <div className="player-avatar" style={{ backgroundColor: player.color }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="player-name-status">{player.name}</div>
                  <div className="status-indicator">
                    {hasSelected ? '✓' : isCurrentPlayer ? '⚡' : '⏳'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Turn Announcement */}
          <div className={`turn-announcement ${isCurrentPlayersTurn ? 'your-turn' : 'waiting'}`}>
            {isCurrentPlayersTurn ? (
              <div className="your-turn-content">
                <div className="pulse-indicator">🎯</div>
                <h3>Your Turn to Draw</h3>
                <p>Choose any face-down card from the table</p>
              </div>
            ) : (
              <div className="waiting-content">
                <div className="waiting-spinner">⏰</div>
                <h3>Waiting for {currentTurnPlayer?.name}</h3>
                <p>to select their card...</p>
              </div>
            )}
          </div>

          {/* Professional Card Table */}
          <div className="card-table">
            <div className="table-felt">
              <div className="table-border"></div>
              <div className="card-grid-new">
                {dealerSelection.dealerCards?.map((card: any, index: number) => (
                  <div
                    key={card.id || index}
                    data-card-id={card.id}
                    className={`playing-card ${card.isFlipped ? 'flipped revealed' : 'face-down'} ${isCurrentPlayersTurn && !card.isFlipped ? 'selectable' : ''}`}
                    onClick={() => isCurrentPlayersTurn && !card.isFlipped && handleCardClick(card.id)}
                    tabIndex={isCurrentPlayersTurn && !card.isFlipped ? 0 : -1}
                    onKeyPress={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && isCurrentPlayersTurn && !card.isFlipped) {
                        e.preventDefault();
                        handleCardClick(card.id);
                      }
                    }}
                  >
                    {card.isFlipped ? (
                      <div className="card-face-new">
                        <div className="card-corner top-left">
                          <div className={`rank ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`}>
                            {card.rank}
                          </div>
                          <div className={`suit ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`}>
                            {getSuitSymbol(card.suit)}
                          </div>
                        </div>
                        <div className="card-center">
                          <div className={`center-suit ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`}>
                            {getSuitSymbol(card.suit)}
                          </div>
                        </div>
                        <div className="card-corner bottom-right">
                          <div className={`rank ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`}>
                            {card.rank}
                          </div>
                          <div className={`suit ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`}>
                            {getSuitSymbol(card.suit)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="card-back-new">
                        <div className="card-pattern">
                          <div className="pattern-design"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )) || Array.from({ length: 18 }, (_, i) => (
                  <div key={i} className="playing-card face-down skeleton">
                    <div className="card-back-new">
                      <div className="card-pattern">
                        <div className="pattern-design"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
