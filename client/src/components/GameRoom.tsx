import React, { useState, useRef, useEffect } from 'react';
import type { GameState, Player } from '../../../shared/src/types/game';
import type { StormGameState } from '../../../shared/src/types/cards';
import ProfessionalDealerSelection from './ProfessionalDealerSelection';
import '../styles/game-ui.css';
import '../styles/professional-dealer-selection.css';

interface GameRoomProps {
  gameState: GameState;
  currentPlayer: Player;
  onGameAction: (action: any) => void;
  onSendMessage: (message: string) => void;
  onSendPrivateMessage: (targetPlayerId: string, message: string) => void;
  players: Player[];
  messages: Array<{
    id: string;
    playerId: string;
    playerName: string;
    message: string;
    timestamp: number;
    isPrivate?: boolean;
    targetPlayerId?: string;
  }>;
}

// Temporary Storms Stage Component
const StormsStage: React.FC<{
  stormState: StormGameState;
  currentPlayer: Player;
  onGameAction: (action: any) => void;
}> = ({ stormState, currentPlayer, onGameAction }) => {
  return (
    <div className="storms-stage-container">
      <div className="storms-header">
        <h2>🌪️ Storm Stage</h2>
        <p>Navigate through the storms and hazards!</p>
      </div>
      
      <div className="storms-content">
        <div className="storms-info">
          <p>Current Player: {stormState.currentPlayerId}</p>
          <p>Cards in Stock: {stormState.stockPile.length}</p>
          <p>Toxic Seven Active: {stormState.toxicSevenActive ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="player-status">
          <h3>Players:</h3>
          {Array.from(stormState.playerHands.entries()).map(([playerId, hand]) => (
            <div key={playerId} className="player-item">
              <span>Player {playerId}</span>
              <span> - Cards: {hand.cardCount}</span>
              {stormState.currentPlayerId === playerId && 
               <span className="current-turn"> (Current Turn)</span>}
            </div>
          ))}
        </div>
        
        {stormState.currentPlayerId === currentPlayer.id && (
          <div className="storms-actions">
            <button 
              onClick={() => onGameAction({ type: 'draw_cards', playerId: currentPlayer.id, count: 1 })}
              className="btn btn-primary"
            >
              Draw Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Placeholder for other stages
const PlaceholderStage: React.FC<{ stageName: string }> = ({ stageName }) => {
  return (
    <div className="placeholder-stage">
      <div className="placeholder-content">
        <h2>🚧 {stageName} Stage</h2>
        <p>This stage is under construction and will be implemented soon.</p>
        <div className="construction-icon">
          <span>⚙️</span>
          <span>🔧</span>
          <span>🏗️</span>
        </div>
      </div>
    </div>
  );
};

const GameRoom: React.FC<GameRoomProps> = ({
  gameState,
  currentPlayer,
  onGameAction,
  onSendMessage,
  onSendPrivateMessage,
  players,
  messages
}) => {
  const [chatMessage, setChatMessage] = useState('');
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [privateTarget, setPrivateTarget] = useState('');
  const [privateMessage, setPrivateMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      onSendMessage(chatMessage.trim());
      setChatMessage('');
    }
  };

  const handleSendPrivateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (privateMessage.trim() && privateTarget) {
      onSendPrivateMessage(privateTarget, privateMessage.trim());
      setPrivateMessage('');
      setShowPrivateModal(false);
      setPrivateTarget('');
    }
  };

  const renderCurrentStage = () => {
    switch (gameState.stage) {
      case 'dealer-selection':
        return (
          <ProfessionalDealerSelection
            dealerState={gameState.dealerSelection!}
            currentPlayer={currentPlayer}
            onGameAction={onGameAction}
          />
        );
      
      case 'storm':
        return (
          <StormsStage
            stormState={gameState.storm!}
            currentPlayer={currentPlayer}
            onGameAction={onGameAction}
          />
        );
      
      case 'racing':
        return <PlaceholderStage stageName="Racing" />;
      
      case 'lane-selection':
        return <PlaceholderStage stageName="Lane Selection" />;
      
      case 'coin':
        return <PlaceholderStage stageName="Coin Placement" />;
      
      default:
        return (
          <div className="unknown-stage">
            <h2>Unknown Stage: {gameState.stage}</h2>
            <p>This stage is not recognized.</p>
          </div>
        );
    }
  };

  return (
    <div className="game-room">
      {/* Main Game Area */}
      <div className="game-main">
        {renderCurrentStage()}
      </div>

      {/* Game Sidebar */}
      <div className="game-sidebar">
        {/* Players List */}
        <div className="players-section">
          <h3>Players ({players.length})</h3>
          <div className="players-list">
            {players.map(player => (
              <div key={player.id} className="player-item">
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  {player.id === currentPlayer.id && <span className="you-badge">(You)</span>}
                  {gameState.room.hostId === player.id && <span className="host-badge">👑</span>}
                </div>
                <button
                  onClick={() => {
                    setPrivateTarget(player.id);
                    setShowPrivateModal(true);
                  }}
                  className="btn btn-sm btn-secondary private-msg-btn"
                  disabled={player.id === currentPlayer.id}
                >
                  💬
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Game Info */}
        <div className="game-info-section">
          <h3>Game Info</h3>
          <div className="game-details">
            <p><strong>Stage:</strong> {gameState.stage}</p>
            <p><strong>Round:</strong> {gameState.roundNumber}</p>
            <p><strong>Room:</strong> {gameState.room.id}</p>
          </div>
        </div>

        {/* Chat */}
        <div className="chat-section">
          <h3>Chat</h3>
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.isPrivate ? 'private-message' : ''}`}>
                <div className="message-header">
                  <span className="message-author">{msg.playerName}</span>
                  {msg.isPrivate && (
                    <span className="private-badge">🔒 Private</span>
                  )}
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">{msg.message}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="chat-form">
            <div className="chat-input-group">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="chat-input"
                maxLength={500}
              />
              <button type="submit" className="btn btn-primary chat-send">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Private Message Modal */}
      {showPrivateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Send Private Message</h3>
              <button
                onClick={() => {
                  setShowPrivateModal(false);
                  setPrivateTarget('');
                  setPrivateMessage('');
                }}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>To:</label>
                <select
                  value={privateTarget}
                  onChange={(e) => setPrivateTarget(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select a player...</option>
                  {players
                    .filter(p => p.id !== currentPlayer.id)
                    .map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                </select>
              </div>
              
              <form onSubmit={handleSendPrivateMessage}>
                <div className="form-group">
                  <label>Message:</label>
                  <textarea
                    value={privateMessage}
                    onChange={(e) => setPrivateMessage(e.target.value)}
                    placeholder="Type your private message..."
                    className="form-textarea"
                    rows={4}
                    maxLength={500}
                    required
                  />
                </div>
                
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrivateModal(false);
                      setPrivateTarget('');
                      setPrivateMessage('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!privateTarget || !privateMessage.trim()}
                    className="btn btn-primary"
                  >
                    Send Private Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
