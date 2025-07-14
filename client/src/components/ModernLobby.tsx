// =================== MODERN LOBBY SYSTEM ===================
// Professional lobby and room management with modern UX patterns

import React, { useState, useCallback } from 'react';
import { Player, GameSettings } from '../../../shared/src/types/game';
import '../styles/modern-design-system.css';
import '../styles/modern-lobby.css';

interface LobbyProps {
  currentPlayer: Player;
  players: Player[];
  settings: GameSettings;
  roomId: string;
  roomName: string;
  onStartGame: () => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onSendMessage: (message: string) => void;
  onSendPrivateMessage: (targetPlayerId: string, message: string) => void;
  onLeaveRoom: () => void;
  messages: Array<{
    id: string;
    playerId: string;
    playerName: string;
    content: string;
    timestamp: number;
    isPrivate?: boolean;
    targetPlayerId?: string;
  }>;
}

interface GameSettingsProps {
  settings: GameSettings;
  isHost: boolean;
  onUpdate: (settings: Partial<GameSettings>) => void;
}

interface ChatProps {
  messages: LobbyProps['messages'];
  currentPlayer: Player;
  players: Player[];
  onSendMessage: (message: string) => void;
  onSendPrivateMessage: (targetPlayerId: string, message: string) => void;
}

interface PlayerListProps {
  players: Player[];
  currentPlayer: Player;
  onSendPrivateMessage: (targetPlayerId: string, message: string) => void;
}

/**
 * Professional Game Settings Component
 */
const GameSettingsPanel: React.FC<GameSettingsProps> = ({
  settings,
  isHost,
  onUpdate
}) => {
  const handleSettingChange = useCallback((key: keyof GameSettings, value: any) => {
    if (!isHost) return;
    onUpdate({ [key]: value });
  }, [isHost, onUpdate]);

  const settingsConfig = [
    {
      key: 'numberOfLaps',
      label: 'Number of Laps',
      description: 'How many laps to complete the race',
      options: [1, 2, 3, 4, 5],
      icon: '🏁'
    },
    {
      key: 'numberOfDice',
      label: 'Movement Dice',
      description: 'Number of dice used for movement',
      options: [1, 2],
      icon: '🎲'
    },
    {
      key: 'numberOfDecks',
      label: 'Card Decks',
      description: 'Number of card decks in play',
      options: [1, 2],
      icon: '🂠'
    },
    {
      key: 'cardsPerHand',
      label: 'Cards Per Hand',
      description: 'Number of cards each player starts with',
      options: [3, 4, 5],
      icon: '🃏'
    },
    {
      key: 'numberOfCoins',
      label: 'Winner Coins',
      description: 'Coins awarded to 1st place',
      options: [1, 2, 3],
      icon: '🪙'
    }
  ];

  return (
    <div className="game-settings-panel">
      <header className="settings-header">
        <h3 className="settings-title">
          <span className="settings-icon">⚙️</span>
          Game Settings
        </h3>
        {!isHost && (
          <span className="readonly-badge">Read Only</span>
        )}
      </header>

      <div className="settings-grid">
        {settingsConfig.map((setting) => (
          <div key={setting.key} className="setting-item">
            <div className="setting-info">
              <div className="setting-label">
                <span className="setting-emoji">{setting.icon}</span>
                <span className="setting-name">{setting.label}</span>
              </div>
              <p className="setting-description">{setting.description}</p>
            </div>
            
            <div className="setting-control">
              <div className="option-buttons">
                {setting.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`option-btn ${
                      settings[setting.key as keyof GameSettings] === option ? 'active' : ''
                    }`}
                    onClick={() => handleSettingChange(setting.key as keyof GameSettings, option)}
                    disabled={!isHost}
                    aria-pressed={settings[setting.key as keyof GameSettings] === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isHost && (
        <div className="settings-footer">
          <p className="host-note">
            💡 As the host, you can change these settings. All players will see the updates instantly.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Professional Player List Component
 */
const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayer,
  onSendPrivateMessage
}) => {
  const [privateMessageTarget, setPrivateMessageTarget] = useState<string | null>(null);
  const [privateMessage, setPrivateMessage] = useState('');

  const handleSendPrivateMessage = useCallback(() => {
    if (!privateMessageTarget || !privateMessage.trim()) return;
    
    onSendPrivateMessage(privateMessageTarget, privateMessage.trim());
    setPrivateMessage('');
    setPrivateMessageTarget(null);
  }, [privateMessageTarget, privateMessage, onSendPrivateMessage]);

  const getPlayerColor = (player: Player): string => {
    const colorMap: Record<string, string> = {
      yellow: '#ca8a04',
      orange: '#ea580c',
      red: '#dc2626',
      pink: '#db2777',
      purple: '#9333ea',
      blue: '#2563eb',
      green: '#16a34a',
      black: '#18181b'
    };
    return colorMap[player.color] || '#2563eb';
  };

  return (
    <div className="player-list-panel">
      <header className="player-list-header">
        <h3 className="player-list-title">
          <span className="players-icon">👥</span>
          Players ({players.length}/8)
        </h3>
      </header>

      <div className="players-container">
        {players.map((player) => (
          <div
            key={player.id}
            className={`player-item ${player.id === currentPlayer.id ? 'current-player' : ''}`}
          >
            <div className="player-info">
              <div 
                className="player-pawn"
                style={{ backgroundColor: getPlayerColor(player) }}
              >
                🏎️
              </div>
              
              <div className="player-details">
                <h4 className="player-name">
                  {player.name}
                  {player.id === currentPlayer.id && <span className="you-badge">(You)</span>}
                </h4>
                <div className="player-meta">
                  <span className="slot-number">Slot {player.roomSlot}</span>
                  {player.isHost && <span className="host-badge">HOST</span>}
                  <span className={`connection-status ${player.isConnected ? 'connected' : 'disconnected'}`}>
                    {player.isConnected ? '🟢' : '🔴'}
                  </span>
                </div>
              </div>
            </div>

            {player.id !== currentPlayer.id && (
              <div className="player-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary private-message-btn"
                  onClick={() => setPrivateMessageTarget(player.id)}
                  title={`Send private message to ${player.name}`}
                >
                  💬
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Private Message Modal */}
      {privateMessageTarget && (
        <div className="private-message-modal">
          <div className="modal-overlay" onClick={() => setPrivateMessageTarget(null)} />
          <div className="modal-content">
            <header className="modal-header">
              <h4>Send Private Message</h4>
              <p>To: {players.find(p => p.id === privateMessageTarget)?.name}</p>
            </header>
            
            <div className="modal-body">
              <textarea
                className="form-input"
                value={privateMessage}
                onChange={(e) => setPrivateMessage(e.target.value)}
                placeholder="Type your private message..."
                rows={3}
                autoFocus
                maxLength={500}
              />
            </div>
            
            <footer className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPrivateMessageTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendPrivateMessage}
                disabled={!privateMessage.trim()}
              >
                Send Message
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Professional Chat Component
 */
const ChatPanel: React.FC<ChatProps> = ({
  messages,
  currentPlayer,
  players,
  onSendMessage,
  onSendPrivateMessage
}) => {
  const [message, setMessage] = useState('');
  const [showPrivateTarget, setShowPrivateTarget] = useState(false);
  const [privateTarget, setPrivateTarget] = useState<string>('');

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    if (privateTarget) {
      onSendPrivateMessage(privateTarget, message.trim());
      setPrivateTarget('');
      setShowPrivateTarget(false);
    } else {
      onSendMessage(message.trim());
    }
    
    setMessage('');
  }, [message, privateTarget, onSendMessage, onSendPrivateMessage]);

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPlayerName = (playerId: string): string => {
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  return (
    <div className="chat-panel">
      <header className="chat-header">
        <h3 className="chat-title">
          <span className="chat-icon">💬</span>
          Room Chat
        </h3>
      </header>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Say hello to start the conversation! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.playerId === currentPlayer.id ? 'own-message' : ''} ${
                msg.isPrivate ? 'private-message' : ''
              }`}
            >
              <div className="message-header">
                <span className="message-author">
                  {msg.playerId === currentPlayer.id ? 'You' : msg.playerName}
                </span>
                {msg.isPrivate && (
                  <span className="private-indicator">
                    🔒 Private {msg.targetPlayerId === currentPlayer.id ? 'to you' : `to ${getPlayerName(msg.targetPlayerId!)}`}
                  </span>
                )}
                <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="input-container">
          {showPrivateTarget && (
            <div className="private-target-selector">
              <select
                className="form-input"
                value={privateTarget}
                onChange={(e) => setPrivateTarget(e.target.value)}
                required
              >
                <option value="">Select recipient...</option>
                {players
                  .filter(p => p.id !== currentPlayer.id)
                  .map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setShowPrivateTarget(false);
                  setPrivateTarget('');
                }}
              >
                Cancel
              </button>
            </div>
          )}
          
          <div className="message-input-row">
            <input
              type="text"
              className="form-input message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                privateTarget 
                  ? `Private message to ${getPlayerName(privateTarget)}...`
                  : "Type a message..."
              }
              maxLength={500}
              disabled={showPrivateTarget && !privateTarget}
            />
            
            <button
              type="button"
              className="btn btn-sm btn-secondary private-btn"
              onClick={() => setShowPrivateTarget(!showPrivateTarget)}
              title="Send private message"
            >
              🔒
            </button>
            
            <button
              type="submit"
              className="btn btn-sm btn-primary send-btn"
              disabled={!message.trim() || (showPrivateTarget && !privateTarget)}
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

/**
 * Professional Main Lobby Component
 */
const ModernLobby: React.FC<LobbyProps> = ({
  currentPlayer,
  players,
  settings,
  roomId,
  roomName,
  onStartGame,
  onUpdateSettings,
  onSendMessage,
  onSendPrivateMessage,
  onLeaveRoom,
  messages
}) => {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const canStartGame = currentPlayer.isHost && players.length >= 2;

  const handleStartGame = useCallback(() => {
    if (!canStartGame) return;
    onStartGame();
  }, [canStartGame, onStartGame]);

  const handleLeaveRoom = useCallback(() => {
    onLeaveRoom();
    setShowLeaveConfirm(false);
  }, [onLeaveRoom]);

  return (
    <div className="modern-lobby">
      {/* Professional Header */}
      <header className="lobby-header">
        <div className="header-content">
          <div className="room-info">
            <h1 className="room-name">{roomName}</h1>
            <div className="room-meta">
              <span className="room-id">Room ID: {roomId}</span>
              <span className="player-count">{players.length}/8 Players</span>
            </div>
          </div>
          
          <div className="header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowLeaveConfirm(true)}
            >
              Leave Room
            </button>
            
            {currentPlayer.isHost && (
              <button
                type="button"
                className={`btn ${canStartGame ? 'btn-success' : 'btn-secondary'}`}
                onClick={handleStartGame}
                disabled={!canStartGame}
              >
                {canStartGame ? '🏁 Start Game' : `Need ${2 - players.length} More Players`}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="lobby-main">
        <div className="lobby-grid">
          {/* Left Column - Settings */}
          <section className="settings-section">
            <GameSettingsPanel
              settings={settings}
              isHost={currentPlayer.isHost}
              onUpdate={onUpdateSettings}
            />
          </section>

          {/* Center Column - Players */}
          <section className="players-section">
            <PlayerList
              players={players}
              currentPlayer={currentPlayer}
              onSendPrivateMessage={onSendPrivateMessage}
            />
          </section>

          {/* Right Column - Chat */}
          <section className="chat-section">
            <ChatPanel
              messages={messages}
              currentPlayer={currentPlayer}
              players={players}
              onSendMessage={onSendMessage}
              onSendPrivateMessage={onSendPrivateMessage}
            />
          </section>
        </div>
      </main>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="leave-confirm-modal">
          <div className="modal-overlay" onClick={() => setShowLeaveConfirm(false)} />
          <div className="modal-content">
            <header className="modal-header">
              <h3>Leave Room?</h3>
              <p>Are you sure you want to leave this room?</p>
            </header>
            
            <footer className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowLeaveConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleLeaveRoom}
              >
                Leave Room
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernLobby;
