import { useState } from 'react';

interface JoinWithCodeProps {
  onJoinWithCode: (roomCode: string) => void;
  isJoining: boolean;
}

export function JoinWithCode({ onJoinWithCode, isJoining }: JoinWithCodeProps) {
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      onJoinWithCode(roomCode.trim().toUpperCase());
      setRoomCode('');
    }
  };

  const handleCodeChange = (value: string) => {
    // Auto-format room codes to uppercase and limit length
    const formatted = value.replace(/[^A-Z0-9]/g, '').substring(0, 6);
    setRoomCode(formatted);
  };

  return (
    <form onSubmit={handleSubmit} className="join-with-code">
      <div className="code-input-section">
        <label className="code-label">Room Code:</label>
        <div className="code-input-group">
          <input
            type="text"
            placeholder="ABC123"
            value={roomCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            disabled={isJoining}
            className="room-code-input"
            maxLength={6}
          />
          <button
            type="submit"
            disabled={!roomCode.trim() || isJoining}
            className="join-code-button"
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      </div>
      <div className="code-hint">
        Enter a 6-character room code to join a private game
      </div>
    </form>
  );
}
