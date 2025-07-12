import { useState, useEffect } from 'react';
import { AutoCompleteInput } from './AutoCompleteInput';
import { RoomList } from './RoomList';
import { CreateRoomForm } from './CreateRoomForm';
import { JoinWithCode } from './JoinWithCode';
import type { GameSettings } from '@havoc-speedway/shared';

interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  stage: string;
  isPublic: boolean;
  code: string;
  settings: GameSettings;
}

interface LobbyProps {
  playerName: string;
  isConnected: boolean;
  rooms: Room[];
  onJoin: (playerName: string, roomId: string) => void;
  onJoinWithCode: (playerName: string, roomCode: string) => void;
  onCreate: (playerName: string, roomName: string, isPublic: boolean, settings: GameSettings) => void;
  onRefreshRooms: () => void;
}

export function Lobby({ 
  playerName: initialPlayerName, 
  isConnected, 
  rooms, 
  onJoin, 
  onJoinWithCode,
  onCreate, 
  onRefreshRooms 
}: LobbyProps) {
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setPlayerName(initialPlayerName);
  }, [initialPlayerName]);

  const handleJoinRoom = async (roomId: string) => {
    if (!playerName.trim()) return;
    
    setIsJoining(true);
    onJoin(playerName.trim(), roomId);
    
    // Save player name to autocomplete
    const storageKey = 'havoc-speedway-player-names';
    const stored = localStorage.getItem(storageKey);
    let history: string[] = [];
    if (stored) {
      try {
        history = JSON.parse(stored);
      } catch (e) {
        history = [];
      }
    }
    const updated = [playerName.trim(), ...history.filter(name => name !== playerName.trim())].slice(0, 5);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    
    setTimeout(() => setIsJoining(false), 2000);
  };

  const handleJoinWithCode = async (roomCode: string) => {
    if (!playerName.trim()) return;
    
    setIsJoining(true);
    onJoinWithCode(playerName.trim(), roomCode);
    
    // Save player name to autocomplete
    const storageKey = 'havoc-speedway-player-names';
    const stored = localStorage.getItem(storageKey);
    let history: string[] = [];
    if (stored) {
      try {
        history = JSON.parse(stored);
      } catch (e) {
        history = [];
      }
    }
    const updated = [playerName.trim(), ...history.filter(name => name !== playerName.trim())].slice(0, 5);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    
    setTimeout(() => setIsJoining(false), 2000);
  };

  const handleCreateRoom = async (roomName: string, isPublic: boolean, settings: GameSettings) => {
    console.log('Lobby handleCreateRoom called with:', { playerName: playerName.trim(), roomName, isPublic, settings });
    if (!playerName.trim()) {
      console.log('Player name is empty, returning');
      return;
    }
    
    setIsCreating(true);
    console.log('Calling onCreate prop');
    onCreate(playerName.trim(), roomName, isPublic, settings);
    
    // Save player name to autocomplete
    const storageKey = 'havoc-speedway-player-names';
    const stored = localStorage.getItem(storageKey);
    let history: string[] = [];
    if (stored) {
      try {
        history = JSON.parse(stored);
      } catch (e) {
        history = [];
      }
    }
    const updated = [playerName.trim(), ...history.filter(name => name !== playerName.trim())].slice(0, 5);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    
    setTimeout(() => {
      console.log('Resetting isCreating to false');
      setIsCreating(false);
    }, 2000);
  };

  return (
    <div className="lobby">
      <div className="lobby-header">
        <h1>🏁 Havoc Speedway</h1>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>
      </div>

      <div className="player-setup">
        <AutoCompleteInput
          label="Your Name"
          placeholder="Enter your player name..."
          value={playerName}
          onChange={setPlayerName}
          storageKey="havoc-speedway-player-names"
          disabled={isJoining || isCreating}
        />
      </div>

      <div className="lobby-content">
        <div className="main-actions">
          <div className="create-room-section">
            <CreateRoomForm
              onCreateRoom={handleCreateRoom}
              isCreating={isCreating}
            />
          </div>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          <div className="join-with-code-section">
            <JoinWithCode
              onJoinWithCode={handleJoinWithCode}
              isJoining={isJoining}
            />
          </div>
        </div>
        
        {(!playerName.trim()) && (
          <div className="name-required-warning">
            ⚠️ Enter your name above to create or join rooms
          </div>
        )}
        
        <div className="room-list-section">
          <RoomList
            rooms={rooms}
            onJoinRoom={handleJoinRoom}
            isConnected={isConnected}
            canJoinRooms={isConnected && !!playerName.trim()}
            onRefresh={onRefreshRooms}
          />
        </div>
      </div>
    </div>
  );
}
