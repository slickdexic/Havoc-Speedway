import { useState } from 'react';

interface Room {
  id: string;
  name: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  isStarted: boolean;
}

interface LobbyProps {
  playerName: string;
  isConnected: boolean;
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (roomName: string) => void;
  onRefreshRooms: () => void;
  onChangeName: (newName: string) => void;
}

export function LobbyNew({ 
  playerName, 
  isConnected, 
  rooms, 
  onJoinRoom, 
  onCreateRoom, 
  onRefreshRooms,
  onChangeName
}: LobbyProps) {
  const [roomName, setRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleCreateRoom = () => {
    if (roomName.trim()) {
      onCreateRoom(roomName.trim());
      setRoomName('');
      setShowCreateForm(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    onJoinRoom(roomId);
  };

  const handleChangeName = () => {
    if (newPlayerName.trim() && newPlayerName.trim() !== playerName) {
      onChangeName(newPlayerName.trim());
      setNewPlayerName('');
      setShowNameForm(false);
    }
  };

  return (
    <div className="lobby-container">
      {/* Header */}
      <header className="lobby-header">
        <div className="lobby-title">
          <h1>🏁 Havoc Speedway</h1>
          <p>Professional racing card game</p>
        </div>
        <div className="player-info">
          <div className="connection-indicator">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
          <div className="player-name">
            Welcome, <strong>{playerName}</strong>
            <button 
              className="btn btn-ghost btn-small"
              onClick={() => {
                setNewPlayerName(playerName);
                setShowNameForm(true);
              }}
              disabled={!isConnected}
              title="Change your name"
            >
              ✏️
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lobby-main">
        {/* Room Actions */}
        <section className="room-actions">
          <button 
            className="btn btn-primary btn-large"
            onClick={() => setShowCreateForm(true)}
            disabled={!isConnected}
          >
            🎯 Host New Game
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={onRefreshRooms}
            disabled={!isConnected}
          >
            🔄 Refresh
          </button>
        </section>

        {/* Create Room Form */}
        {showCreateForm && (
          <section className="create-room-form">
            <div className="form-card">
              <h3>Create New Game Room</h3>
              <div className="form-group">
                <label htmlFor="roomName">Room Name</label>
                <input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name..."
                  maxLength={50}
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateRoom}
                  disabled={!roomName.trim()}
                >
                  Create Room
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowCreateForm(false);
                    setRoomName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Change Name Form */}
        {showNameForm && (
          <section className="create-room-form">
            <div className="form-card">
              <h3>Change Your Name</h3>
              <div className="form-group">
                <label htmlFor="newPlayerName">Your Name</label>
                <input
                  id="newPlayerName"
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Enter your new name..."
                  maxLength={20}
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleChangeName}
                  disabled={!newPlayerName.trim() || newPlayerName.trim() === playerName}
                >
                  Change Name
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowNameForm(false);
                    setNewPlayerName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Room List */}
        <section className="room-list">
          <h2>Available Games</h2>
          
          {!isConnected && (
            <div className="status-message">
              <div className="loading-spinner"></div>
              Connecting to server...
            </div>
          )}

          {isConnected && rooms.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🎲</div>
              <h3>No games available</h3>
              <p>Be the first to host a game!</p>
            </div>
          )}

          {isConnected && rooms.length > 0 && (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <div key={room.id} className={`room-card ${room.isStarted ? 'started' : 'waiting'}`}>
                  <div className="room-header">
                    <h3 className="room-name">{room.name}</h3>
                    <div className={`room-status ${room.isStarted ? 'started' : 'waiting'}`}>
                      {room.isStarted ? '🎮 In Game' : '⏳ Waiting'}
                    </div>
                  </div>
                  
                  <div className="room-info">
                    <div className="room-host">
                      👤 Host: <strong>{room.hostName}</strong>
                    </div>
                    <div className="room-players">
                      👥 Players: <strong>{room.playerCount}/{room.maxPlayers}</strong>
                    </div>
                  </div>

                  <div className="room-actions">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={room.isStarted || room.playerCount >= room.maxPlayers}
                    >
                      {room.isStarted ? 'In Progress' : 
                       room.playerCount >= room.maxPlayers ? 'Full' : 'Join Game'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
