import { useState, useEffect } from 'react';
import type { GameSettings, Player, PlayerColor } from '@havoc-speedway/shared';
import { GameSounds, soundManager } from '../utils/SoundManager';
import { GameAnimations } from '../utils/AnimationManager';
import Track from './Track';

interface GameState {
  roomName: string;
  stage: string;
  players: Player[];
  settings?: GameSettings;
  message?: string;
}

interface GameRoomProps {
  gameState: GameState;
  currentPlayerId: string;
  isHost: boolean;
  onLeaveRoom: () => void;
  onStartGame: () => void;
  onKickPlayer: (playerId: string) => void;
  onChangeSettings: (settings: GameSettings) => void;
  onSendMessage: (message: string, isPrivate: boolean, targetPlayerId?: string) => void;
  onChangeColor: (color: string) => void;
  onPlayerAction: (action: any) => void; // For game stage actions
  chatMessages: Array<{
    id: string;
    sender: string;
    content: string;
    isPrivate: boolean;
    timestamp: number;
  }>;
}

export function GameRoom({ 
  gameState, 
  currentPlayerId, 
  isHost, 
  onLeaveRoom, 
  onStartGame, 
  onKickPlayer, 
  onChangeSettings,
  onSendMessage,
  onChangeColor,
  onPlayerAction,
  chatMessages
}: GameRoomProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState('');
  const [privateMessage, setPrivateMessage] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

  // Initialize sound system on mount
  useEffect(() => {
    soundManager.initialize();
    GameSounds.playLobbyMusic();
    
    return () => {
      GameSounds.stopMusic();
    };
  }, []);

  // Play appropriate music based on game stage
  useEffect(() => {
    if (gameState.stage === 'waiting') {
      GameSounds.playLobbyMusic();
    } else if (gameState.stage === 'dealer_selection' || gameState.stage === 'storm') {
      GameSounds.stopMusic();
      GameSounds.playGameMusic();
    } else if (gameState.stage === 'racing') {
      GameSounds.stopMusic();
      GameSounds.playRacingMusic();
    }
  }, [gameState.stage]);

  // Add card flip animations
  useEffect(() => {
    if (gameState.stage === 'dealer_selection') {
      const dealerSelection = (gameState as any).dealerSelection;
      if (dealerSelection?.dealerCards) {
        const flippedCards = dealerSelection.dealerCards.filter((card: any) => card.isFlipped);
        flippedCards.forEach((card: any, index: number) => {
          const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
          if (cardElement) {
            setTimeout(() => {
              GameSounds.cardFlip();
              GameAnimations.flipCard(cardElement);
            }, index * 200);
          }
        });
      }
    }
  }, [gameState]);

  // Add entrance animations for new players
  useEffect(() => {
    const playerElements = document.querySelectorAll('.player-card:not(.animated)');
    playerElements.forEach((element, index) => {
      element.classList.add('animated');
      setTimeout(() => {
        GameAnimations.playerJoin(element);
      }, index * 150);
    });
  }, [gameState.players.length]);

  // Add entrance animations for new chat messages
  useEffect(() => {
    const newMessages = document.querySelectorAll('.message:not(.animated)');
    newMessages.forEach((element) => {
      element.classList.add('animated');
      GameAnimations.messageReceived(element);
      if (element.classList.contains('private')) {
        GameSounds.notification();
      }
    });
  }, [chatMessages]);

  const isWaiting = gameState.stage === 'waiting' || gameState.stage === 'dealer-selection';
  const canStart = isHost && gameState.players.length >= 2 && isWaiting;

  const handleSendRoomChat = () => {
    if (message.trim()) {
      GameSounds.buttonClick();
      onSendMessage(message.trim(), false);
      setMessage('');
    }
  };

  const handleSendPrivateMessage = () => {
    if (privateMessage.trim() && selectedPlayer) {
      GameSounds.buttonClick();
      onSendMessage(privateMessage.trim(), true, selectedPlayer);
      setPrivateMessage('');
      setSelectedPlayer('');
    }
  };

  const availableColors: PlayerColor[] = ['yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'green', 'black'];
  const usedColors = gameState.players.map(p => p.color);
  const unusedColors = availableColors.filter(color => !usedColors.includes(color));

  return (
    <div className="game-room">
      <div className="game-header">
        <div className="room-title">
          <h1>🏁 {gameState.roomName}</h1>
          <div className="room-stage">
            Stage: <span className={`stage ${gameState.stage}`}>{gameState.stage}</span>
          </div>
        </div>
        
        <div className="header-controls">
          {isHost && isWaiting && (
            <button 
              onClick={() => {
                GameSounds.buttonClick();
                setShowSettings(!showSettings);
              }} 
              className="settings-button"
            >
              ⚙️ Settings
            </button>
          )}
          <button onClick={() => {
            GameSounds.buttonClick();
            onLeaveRoom();
          }} className="leave-room-button">
            🚪 Leave Room
          </button>
        </div>
      </div>

      {gameState.message && (
        <div className="game-message">
          {gameState.message}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && isHost && gameState.settings && (
        <div className="settings-panel">
          <h3>🎮 Game Settings</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Laps:</label>
              <select 
                value={gameState.settings.numberOfLaps}
                onChange={(e) => onChangeSettings({
                  ...gameState.settings!,
                  numberOfLaps: Number(e.target.value) as 1|2|3|4|5
                })}
              >
                {[1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n} Lap{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            
            <div className="setting-item">
              <label>Dice:</label>
              <select 
                value={gameState.settings.numberOfDice}
                onChange={(e) => onChangeSettings({
                  ...gameState.settings!,
                  numberOfDice: Number(e.target.value) as 1|2
                })}
              >
                <option value={1}>1 Die</option>
                <option value={2}>2 Dice</option>
              </select>
            </div>
            
            <div className="setting-item">
              <label>Decks:</label>
              <select 
                value={gameState.settings.numberOfDecks}
                onChange={(e) => onChangeSettings({
                  ...gameState.settings!,
                  numberOfDecks: Number(e.target.value) as 1|2
                })}
              >
                <option value={1}>1 Deck</option>
                <option value={2}>2 Decks</option>
              </select>
            </div>
            
            <div className="setting-item">
              <label>Cards:</label>
              <select 
                value={gameState.settings.cardsPerHand}
                onChange={(e) => onChangeSettings({
                  ...gameState.settings!,
                  cardsPerHand: Number(e.target.value) as 3|4|5
                })}
              >
                {[3,4,5].map(n => (
                  <option key={n} value={n}>{n} Cards</option>
                ))}
              </select>
            </div>
            
            <div className="setting-item">
              <label>Coins:</label>
              <select 
                value={gameState.settings.numberOfCoins}
                onChange={(e) => onChangeSettings({
                  ...gameState.settings!,
                  numberOfCoins: Number(e.target.value) as 1|2|3
                })}
              >
                {[1,2,3].map(n => (
                  <option key={n} value={n}>{n} Coin{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Stage-Specific Content */}
      <div className="stage-content">
        {gameState.stage === 'dealer-selection' && (
          <DealerSelectionStage 
            gameState={gameState}
            currentPlayerId={currentPlayerId}
            onPlayerAction={onPlayerAction}
          />
        )}
        
        {gameState.stage === 'storm' && (
          <StormStage 
            gameState={gameState}
            currentPlayerId={currentPlayerId}
            onPlayerAction={onPlayerAction}
          />
        )}
        
        {gameState.stage === 'laneSelection' && (
          <Track
            stage="lane-selection"
            gameState={gameState}
            currentPlayerId={currentPlayerId}
            onPlayerAction={onPlayerAction}
          />
        )}
        
        {gameState.stage === 'coin' && (
          <Track
            stage="coin"
            gameState={gameState}
            currentPlayerId={currentPlayerId}
            onPlayerAction={onPlayerAction}
          />
        )}
        
        {gameState.stage === 'racing' && (
          <Track
            stage="racing"
            gameState={gameState}
            currentPlayerId={currentPlayerId}
            onPlayerAction={onPlayerAction}
          />
        )}
      </div>

      {/* Players Section */}
      <div className="players-section animate-slide-up">
        <div className="section-header">
          <div className="section-title">👥 Players</div>
          <div className="player-count">
            <div className="badge badge-primary">{gameState.players.length}/4</div>
          </div>
        </div>
        
        <div className="players-grid">
          {gameState.players.map((player, index) => (
            <div 
              key={player.id} 
              className={`player-card ${player.id === currentPlayerId ? 'current-player' : ''} ${!player.isConnected ? 'disconnected' : ''} animate-fade-in hover-lift`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="player-header">
                <div className="player-avatar">
                  <div className={`avatar-circle color-${player.color}`}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="connection-indicator">
                    {player.isConnected ? '🟢' : '🔴'}
                  </div>
                </div>
                
                <div className="player-info">
                  <div className="player-name">
                    <span className="name-text">{player.name}</span>
                    <div className="player-badges">
                      {player.isHost && <span className="badge badge-gold" title="Host">👑</span>}
                      {!player.isConnected && <span className="badge badge-danger" title="Disconnected">⚠️</span>}
                    </div>
                  </div>
                  
                  <div className="player-details">
                    <div className={`player-color-indicator color-${player.color}`}>
                      <div className="color-dot"></div>
                      <span className="color-name">{player.color}</span>
                    </div>
                    
                    {player.id === currentPlayerId && (
                      <div className="badge badge-success">You</div>
                    )}
                  </div>
                </div>
                
                <div className="player-actions">
                  {isHost && !player.isHost && (
                    <button 
                      onClick={() => onKickPlayer(player.id)}
                      className="btn btn-sm btn-danger kick-button hover-lift"
                      title="Kick Player"
                      aria-label={`Kick ${player.name}`}
                    >
                      ❌
                    </button>
                  )}
                  
                  {player.id !== currentPlayerId && (
                    <button 
                      onClick={() => setSelectedPlayer(player.id)}
                      className="btn btn-sm btn-secondary private-message-button hover-lift"
                      title="Send Private Message"
                      aria-label={`Send private message to ${player.name}`}
                    >
                      💬
                    </button>
                  )}
                </div>
              </div>
              
              {player.id === currentPlayerId && unusedColors.length > 0 && isWaiting && (
                <div className="color-changer animate-slide-down">
                  <label className="color-changer-label">Change Color:</label>
                  <select 
                    value={player.color}
                    onChange={(e) => onChangeColor(e.target.value)}
                    className="color-select"
                    aria-label="Change your color"
                  >
                    <option value={player.color}>{player.color}</option>
                    {unusedColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: 4 - gameState.players.length }, (_, i) => (
            <div key={`empty-${i}`} className="player-card empty-slot animate-fade-in">
              <div className="empty-slot-content">
                <div className="empty-avatar">👤</div>
                <div className="waiting-text">Waiting for player...</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      {canStart && (
        <div className="game-controls">
          <button onClick={() => {
            GameSounds.buttonClick();
            onStartGame();
          }} className="start-game-button">
            🎮 Start Game
          </button>
        </div>
      )}

      {/* Chat Section */}
      <div className="chat-section animate-slide-up">
        <div className="chat-header">
          <div className="section-title">💬 Chat</div>
          <div className="chat-status">
            <div className="badge badge-info">{chatMessages.length} message{chatMessages.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="no-messages">
              <div className="text-muted">💭 No messages yet... Start the conversation!</div>
            </div>
          ) : (
            chatMessages.map((msg, index) => (
              <div 
                key={msg.id} 
                className={`message ${msg.isPrivate ? 'private animate-fade-in' : 'public animate-slide-in'}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="message-header">
                  <span className="message-sender">{msg.sender}</span>
                  <span className="message-time">{new Date(msg.timestamp || Date.now()).toLocaleTimeString()}</span>
                  {msg.isPrivate && <span className="private-indicator">🔒</span>}
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))
          )}
        </div>
        
        <div className="chat-input">
          <div className="room-chat">
            <div className="input-group">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendRoomChat()}
                placeholder="Type a message to all players..."
                className="chat-input-field"
                maxLength={500}
              />
              <button 
                onClick={handleSendRoomChat} 
                className="btn btn-primary send-button"
                disabled={!message.trim()}
                aria-label="Send message to all players"
              >
                📤 Send
              </button>
            </div>
          </div>
          
          {selectedPlayer && (
            <div className="private-chat animate-slide-down">
              <div className="private-chat-header">
                <div className="private-chat-title">
                  🔒 Private message to <strong>{gameState.players.find(p => p.id === selectedPlayer)?.name}</strong>
                </div>
                <button 
                  onClick={() => setSelectedPlayer('')} 
                  className="btn btn-sm btn-secondary close-private"
                  aria-label="Close private chat"
                >
                  ❌
                </button>
              </div>
              <div className="private-chat-input">
                <div className="input-group">
                  <input
                    type="text"
                    value={privateMessage}
                    onChange={(e) => setPrivateMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendPrivateMessage()}
                    placeholder="Type a private message..."
                    className="chat-input-field"
                    maxLength={500}
                  />
                  <button 
                    onClick={handleSendPrivateMessage} 
                    className="btn btn-warning send-button"
                    disabled={!privateMessage.trim()}
                    aria-label="Send private message"
                  >
                    🔐 Send Private
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Dealer Selection Stage Component
interface DealerSelectionStageProps {
  gameState: GameState;
  currentPlayerId: string;
  onPlayerAction: (action: any) => void;
}

function DealerSelectionStage({ gameState, currentPlayerId, onPlayerAction }: DealerSelectionStageProps) {
  const dealerSelection = (gameState as any).dealerSelection;
  
  if (!dealerSelection) {
    return (
      <div className="dealer-selection-stage">
        <div className="stage-loading">Loading dealer selection...</div>
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

  return (
    <div className="dealer-selection-stage">
      {/* Player Cards at Top */}
      <div className="player-cards-container">
        <div className="player-cards">
          {gameState.players.map((player) => {
            const isCurrentPlayer = player.id === currentPlayerId;
            const playerSelectedCard = dealerSelection.selectedCards?.[player.id];
            
            return (
              <div 
                key={player.id} 
                className={`player-card ${isCurrentPlayer ? 'current-player' : ''}`}
              >
                {/* Player Name - centered above middle */}
                <div className="player-name">{player.name}</div>
                
                {/* Player Pawn - centered below name */}
                <div className={`player-pawn color-${player.color}`}>
                  ♟
                </div>
                
                {/* Selected Card Display - in dealer button area */}
                {playerSelectedCard && (
                  <div className="dealer-button-area">
                    <div className="selected-card">
                      <div className={`card-rank ${playerSelectedCard.suit === 'hearts' || playerSelectedCard.suit === 'diamonds' ? 'red' : 'black'}`}>
                        {playerSelectedCard.rank}
                      </div>
                      <div className={`card-suit ${playerSelectedCard.suit === 'hearts' || playerSelectedCard.suit === 'diamonds' ? 'red' : 'black'}`}>
                        {playerSelectedCard.suit}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dealer-selection-content">
        {isComplete ? (
          <div className="dealer-determined">
            <h3>🏆 Dealer Selected!</h3>
            <p>
              <strong>{gameState.players.find(p => p.id === dealerSelection.dealerId)?.name}</strong> is the dealer!
            </p>
          </div>
        ) : (
          <>
            {/* Turn Indicator */}
            <div className="turn-indicator">
              {isCurrentPlayersTurn ? (
                <div className="your-turn">
                  <div className="turn-text">🎯 Your Turn</div>
                  <div className="turn-subtitle">Select a face-down card</div>
                </div>
              ) : (
                <div className="waiting-turn">
                  ⏳ Waiting for <strong>{gameState.players.find(p => p.id === dealerSelection.currentSelectingPlayerId)?.name}</strong> to select...
                </div>
              )}
            </div>
            
            {/* Card Grid - 3 rows of 6 cards (18 total) */}
            <div className="card-grid">
              {dealerSelection.dealerCards?.map((card: any, index: number) => (
                <div
                  key={card.id || index}
                  data-card-id={card.id}
                  className={`dealer-card ${card.isFlipped ? 'flipped' : ''} ${isCurrentPlayersTurn && !card.isFlipped ? 'selectable' : ''}`}
                  onClick={() => isCurrentPlayersTurn && !card.isFlipped && handleCardClick(card.id)}
                  tabIndex={isCurrentPlayersTurn && !card.isFlipped ? 0 : -1}
                  onKeyPress={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && isCurrentPlayersTurn && !card.isFlipped) {
                      e.preventDefault();
                      handleCardClick(card.id);
                    }
                  }}
                  aria-label={card.isFlipped ? `${card.rank} of ${card.suit}` : `Face-down card ${index + 1}`}
                >
                  {card.isFlipped ? (
                    <div className="card-face">
                      <div className={`card-rank ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`}>
                        {card.rank}
                      </div>
                      <div className={`card-suit ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`}>
                        {card.suit}
                      </div>
                    </div>
                  ) : (
                    <div className="card-back">🂠</div>
                  )}
                </div>
              )) || Array.from({ length: 18 }, (_, i) => (
                <div key={i} className="dealer-card skeleton">
                  <div className="card-back">🂠</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Storm Stage Component
interface StormStageProps {
  gameState: GameState;
  currentPlayerId: string;
  onPlayerAction: (action: any) => void;
}

function StormStage({ gameState, currentPlayerId, onPlayerAction }: StormStageProps) {
  const storm = (gameState as any).storm; // Cast to access storm
  
  if (!storm) {
    return (
      <div className="storm-stage">
        <div className="stage-header">
          <div className="stage-title">🌪️ Storm Stage</div>
          <div className="stage-subtitle">Preparing the storm...</div>
        </div>
        <div className="loading skeleton skeleton-card"></div>
      </div>
    );
  }

  const handlePlayCard = (cardId: string, calledSuit?: string) => {
    GameSounds.cardSelect();
    onPlayerAction({
      type: 'PLAY_CARD',
      playerId: currentPlayerId,
      cardId,
      calledSuit
    });
  };

  const handleDrawCards = () => {
    GameSounds.cardDeal();
    onPlayerAction({
      type: 'DRAW_CARDS',
      playerId: currentPlayerId,
      count: storm.toxicDrawAmount || 1
    });
  };

  const isCurrentPlayersTurn = storm.currentPlayerId === currentPlayerId;
  const playerHand = storm.playerHands?.get(currentPlayerId);
  const topCard = storm.discardPile?.[storm.discardPile.length - 1];
  const currentTurnPlayer = gameState.players.find(p => p.id === storm.currentPlayerId);

  return (
    <div className="storm-stage animate-fade-in">
      <div className="stage-header">
        <div className="stage-title">🌪️ Storm Stage</div>
        <div className="stage-subtitle">Navigate through the storm with strategy</div>
      </div>
      
      <div className="storm-content">
        {/* Turn Indicator */}
        <div className={`turn-indicator ${isCurrentPlayersTurn ? 'your-turn animate-glow' : 'waiting-turn'}`}>
          {isCurrentPlayersTurn ? (
            <div>
              <div className="text-xl font-bold">🎯 Your Turn!</div>
              {storm.toxicSevenActive && (
                <div className="toxic-warning animate-pulse">
                  <div className="text-lg font-bold text-danger">☠️ Toxic 7 Active!</div>
                  <div className="text-sm">Play a 7 or draw {storm.toxicDrawAmount} cards</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-lg">
              ⏳ Waiting for <strong>{currentTurnPlayer?.name}</strong> to play...
            </div>
          )}
        </div>

        <div className="storm-board">
          {/* Discard Pile */}
          <div className="discard-section">
            <h5 className="section-title">🗂️ Current Card</h5>
            {topCard ? (
              <div className="top-card animate-card-flip">
                <div className={`card-display large ${topCard.suit === 'hearts' || topCard.suit === 'diamonds' ? 'red-card' : 'black-card'}`}>
                  <div className="card-rank">{topCard.rank}</div>
                  <div className="card-suit">{topCard.suit}</div>
                </div>
                {storm.calledSuit && (
                  <div className="called-suit badge badge-warning animate-slide-up">
                    Called: {storm.calledSuit}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-card">
                <div className="text-muted">No cards played yet</div>
              </div>
            )}
          </div>

          {/* Player Hand */}
          {playerHand && (
            <div className="player-hand-section">
              <h5 className="section-title">
                🃏 Your Hand ({playerHand.cardCount} card{playerHand.cardCount !== 1 ? 's' : ''})
              </h5>
              <div className="hand-cards">
                {playerHand.cards.map((card: any, index: number) => (
                  <div
                    key={card.id}
                    className={`hand-card ${isCurrentPlayersTurn ? 'clickable hover-lift' : ''} animate-card-deal`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => isCurrentPlayersTurn && handlePlayCard(card.id)}
                    tabIndex={isCurrentPlayersTurn ? 0 : -1}
                    onKeyPress={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && isCurrentPlayersTurn) {
                        e.preventDefault();
                        handlePlayCard(card.id);
                      }
                    }}
                    aria-label={`Play ${card.rank} of ${card.suit}`}
                  >
                    <div className={`card-display ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red-card' : 'black-card'}`}>
                      <div className="card-rank">{card.rank}</div>
                      <div className="card-suit">{card.suit}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {isCurrentPlayersTurn && (
                <div className="storm-actions">
                  <button 
                    onClick={handleDrawCards}
                    className="btn btn-secondary hover-lift"
                    aria-label={`Draw ${storm.toxicDrawAmount || 1} card${storm.toxicDrawAmount > 1 ? 's' : ''}`}
                  >
                    📥 Draw {storm.toxicDrawAmount || 1} Card{storm.toxicDrawAmount > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Storm Stats */}
        <div className="storm-stats">
          <div className="stat-item">
            <div className="stat-label">Cards in Deck</div>
            <div className="stat-value">{storm.deckCount || 0}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Players Remaining</div>
            <div className="stat-value">{gameState.players.length}</div>
          </div>
          {storm.toxicSevenActive && (
            <div className="stat-item toxic-indicator">
              <div className="stat-label">☠️ Toxic Draw</div>
              <div className="stat-value">{storm.toxicDrawAmount}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameRoom;
