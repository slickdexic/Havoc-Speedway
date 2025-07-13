import { useState } from 'react';
import type { GameSettings, Player, PlayerColor } from '@havoc-speedway/shared';

interface RoomProps {
  roomName: string;
  players: Player[];
  currentPlayerId: string;
  isHost: boolean;
  settings: GameSettings;
  onLeaveRoom: () => void;
  onStartGame: () => void;
  onKickPlayer: (playerId: string) => void;
  onChangeSettings: (settings: GameSettings) => void;
  onChangeColor: (color: string) => void;
  onSendMessage: (message: string, isPrivate: boolean, targetPlayerId?: string) => void;
  onChangeName: (newName: string) => void;
  chatMessages: Array<{
    id: string;
    sender: string;
    content: string;
    isPrivate: boolean;
    timestamp: number;
  }>;
}

export function Room({
  roomName,
  players,
  currentPlayerId,
  isHost,
  settings,
  onLeaveRoom,
  onStartGame,
  onKickPlayer,
  onChangeSettings,
  onChangeColor,
  onSendMessage,
  onChangeName,
  chatMessages
}: RoomProps) {
  const [message, setMessage] = useState('');
  const [showNameChange, setShowNameChange] = useState(false);
  const [newName, setNewName] = useState('');
  const [privateMessage, setPrivateMessage] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

  // Debug logging
  console.log('Room component render - players:', players.map(p => `${p.name} (${p.id.slice(0,8)})`));

  const availableColors: PlayerColor[] = ['yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'green', 'black'];
  const usedColors = players.map(p => p.color);
  const unusedColors = availableColors.filter(color => !usedColors.includes(color));
  
  const canStart = isHost && players.length >= 2;

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), false);
      setMessage('');
    }
  };

  const handleSendPrivateMessage = () => {
    if (privateMessage.trim() && selectedPlayer) {
      onSendMessage(privateMessage.trim(), true, selectedPlayer);
      setPrivateMessage('');
      setSelectedPlayer('');
    }
  };

  const handleChangeName = () => {
    if (newName.trim()) {
      onChangeName(newName.trim());
      setNewName('');
      setShowNameChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="room-container">
      {/* Header */}
      <header className="room-header">
        <div className="room-title">
          <h1>🏁 {roomName}</h1>
          <div className="room-subtitle">
            Pre-Game Lobby • {players.length}/4 Players
          </div>
        </div>
        <div className="room-controls">
          <button 
            className="btn btn-danger"
            onClick={onLeaveRoom}
          >
            🚪 Leave Room
          </button>
        </div>
      </header>

      <div className="room-content">
        {/* Game Settings - Always Visible */}
        <section className="settings-panel">
          <div className="settings-card">
            <h3>🎮 Game Rules {!isHost && <span className="readonly-indicator">(Host Controls)</span>}</h3>
            <div className="settings-grid">
              <div className="setting-group">
                <label>🏁 Race Length</label>
                {isHost ? (
                  <select 
                    value={settings.numberOfLaps}
                    onChange={(e) => onChangeSettings({
                      ...settings,
                      numberOfLaps: Number(e.target.value) as 1|2|3|4|5
                    })}
                  >
                    {[1,2,3,4,5].map(n => (
                      <option key={n} value={n}>{n} Lap{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                ) : (
                  <div className="setting-value">{settings.numberOfLaps} Lap{settings.numberOfLaps > 1 ? 's' : ''}</div>
                )}
              </div>
              
              <div className="setting-group">
                <label>🎲 Movement Dice</label>
                {isHost ? (
                  <select 
                    value={settings.numberOfDice}
                    onChange={(e) => onChangeSettings({
                      ...settings,
                      numberOfDice: Number(e.target.value) as 1|2
                    })}
                  >
                    <option value={1}>1 Die</option>
                    <option value={2}>2 Dice</option>
                  </select>
                ) : (
                  <div className="setting-value">{settings.numberOfDice} {settings.numberOfDice === 1 ? 'Die' : 'Dice'}</div>
                )}
              </div>
              
              <div className="setting-group">
                <label>🃏 Card Decks</label>
                {isHost ? (
                  <select 
                    value={settings.numberOfDecks}
                    onChange={(e) => onChangeSettings({
                      ...settings,
                      numberOfDecks: Number(e.target.value) as 1|2
                    })}
                  >
                    <option value={1}>Single Deck (32 cards)</option>
                    <option value={2}>Double Deck (64 cards)</option>
                  </select>
                ) : (
                  <div className="setting-value">{settings.numberOfDecks === 1 ? 'Single Deck (32 cards)' : 'Double Deck (64 cards)'}</div>
                )}
              </div>

              <div className="setting-group">
                <label>🎴 Starting Hand</label>
                {isHost ? (
                  <select 
                    value={settings.cardsPerHand}
                    onChange={(e) => onChangeSettings({
                      ...settings,
                      cardsPerHand: Number(e.target.value) as 3|4|5
                    })}
                  >
                    {[3,4,5].map(n => (
                      <option key={n} value={n}>{n} Cards</option>
                    ))}
                  </select>
                ) : (
                  <div className="setting-value">{settings.cardsPerHand} Cards</div>
                )}
              </div>

              <div className="setting-group">
                <label>🪙 Coins per Player</label>
                {isHost ? (
                  <select 
                    value={settings.numberOfCoins}
                    onChange={(e) => onChangeSettings({
                      ...settings,
                      numberOfCoins: Number(e.target.value) as 1|2|3
                    })}
                  >
                    {[1,2,3].map(n => (
                      <option key={n} value={n}>{n} Coin{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                ) : (
                  <div className="setting-value">{settings.numberOfCoins} Coin{settings.numberOfCoins > 1 ? 's' : ''}</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="room-main">
          {/* Players Section */}
          <section className="players-section">
            <h2>Players in Room</h2>
            <div className="players-grid">
              {[...Array(4)].map((_, index) => {
                const player = players[index];
                const isEmpty = !player;
                
                return (
                  <div key={index} className={`player-slot ${isEmpty ? 'empty' : 'occupied'}`}>
                    {isEmpty ? (
                      <div className="empty-slot">
                        <div className="empty-icon">👤</div>
                        <div className="empty-text">Waiting for player...</div>
                      </div>
                    ) : (
                      <div className="player-info">
                        <div className="player-header">
                          <div className={`player-color-indicator color-${player.color}`}></div>
                          <div className="player-details">
                            <div className="player-name">
                              {player.name}
                              {player.isHost && <span className="host-badge">👑 Host</span>}
                            </div>
                            <div className="player-status">
                              <span className={`status-indicator ${player.isConnected ? 'connected' : 'disconnected'}`}></span>
                              {player.isConnected ? 'Connected' : 'Disconnected'}
                            </div>
                          </div>
                        </div>

                        <div className="player-actions">
                          {player.id === currentPlayerId && (
                            <>
                              <div className="color-selection">
                                <label>Color:</label>
                                <select 
                                  value={player.color}
                                  onChange={(e) => onChangeColor(e.target.value)}
                                >
                                  <option value={player.color}>{player.color}</option>
                                  {unusedColors.map(color => (
                                    <option key={color} value={color}>{color}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="name-change-section">
                                {!showNameChange ? (
                                  <button 
                                    className="btn btn-ghost btn-small"
                                    onClick={() => {
                                      setNewName(player.name);
                                      setShowNameChange(true);
                                    }}
                                    title="Change your name"
                                  >
                                    ✏️ Change Name
                                  </button>
                                ) : (
                                  <div className="name-change-form">
                                    <input
                                      type="text"
                                      value={newName}
                                      onChange={(e) => setNewName(e.target.value)}
                                      placeholder="Enter new name..."
                                      maxLength={20}
                                      autoFocus
                                    />
                                    <div className="form-actions">
                                      <button 
                                        className="btn btn-primary btn-small"
                                        onClick={handleChangeName}
                                        disabled={!newName.trim() || newName.trim() === player.name}
                                      >
                                        Save
                                      </button>
                                      <button 
                                        className="btn btn-ghost btn-small"
                                        onClick={() => {
                                          setShowNameChange(false);
                                          setNewName('');
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                          
                          {player.id !== currentPlayerId && (
                            <button 
                              className="btn btn-secondary btn-small"
                              onClick={() => setSelectedPlayer(player.id)}
                              title={`Send private message to ${player.name}`}
                            >
                              💬 Message
                            </button>
                          )}
                          
                          {isHost && player.id !== currentPlayerId && (
                            <button 
                              className="btn btn-danger btn-small"
                              onClick={() => onKickPlayer(player.id)}
                            >
                              Kick
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Chat Section */}
          <section className="chat-section">
            <h3>Room Chat</h3>
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="no-messages">
                  No messages yet. Say hello to your fellow racers!
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.isPrivate ? 'private' : 'public'}`}>
                    <div className="message-header">
                      <span className="sender">{msg.sender}</span>
                      <span className="timestamp">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))
              )}
            </div>
            
            <div className="chat-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                maxLength={200}
              />
              <button 
                className="btn btn-primary"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                Send
              </button>
            </div>
          </section>
        </div>

        {/* Private Message Modal */}
        {selectedPlayer && (
          <div className="private-message-overlay">
            <div className="private-message-modal">
              <div className="modal-header">
                <h4>Send Private Message to {players.find(p => p.id === selectedPlayer)?.name}</h4>
                <button 
                  className="btn btn-ghost"
                  onClick={() => setSelectedPlayer('')}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <textarea
                  value={privateMessage}
                  onChange={(e) => setPrivateMessage(e.target.value)}
                  placeholder="Type your private message..."
                  maxLength={200}
                  rows={3}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-primary"
                  onClick={handleSendPrivateMessage}
                  disabled={!privateMessage.trim()}
                >
                  Send Private Message
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedPlayer('');
                    setPrivateMessage('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start Game Section */}
        <section className="start-game-section">
          {isHost ? (
            <div className="host-controls">
              <div className="ready-status">
                {players.length < 2 && (
                  <div className="warning">⚠️ Need at least 2 players to start</div>
                )}
                {players.length >= 2 && (
                  <div className="ready">✅ Ready to start game</div>
                )}
              </div>
              <button 
                className="btn btn-primary btn-large start-button"
                onClick={onStartGame}
                disabled={!canStart}
              >
                🏁 Start Game
              </button>
            </div>
          ) : (
            <div className="waiting-for-host">
              <div className="waiting-icon">⏳</div>
              <div className="waiting-text">Waiting for host to start the game...</div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
