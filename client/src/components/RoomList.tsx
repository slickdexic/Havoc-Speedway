import { useState } from 'react';
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

interface RoomListProps {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
  isConnected: boolean;
  canJoinRooms: boolean;
  onRefresh: () => void;
}

export function RoomList({ rooms, onJoinRoom, isConnected, canJoinRooms, onRefresh }: RoomListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStageDisplay = (stage: string) => {
    switch (stage) {
      case 'waiting': return 'Waiting for Players';
      case 'dealer_selection': return 'Selecting Dealer';
      case 'storm_rules': return 'In Game';
      default: return stage;
    }
  };

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>Available Rooms</h3>
        <button 
          onClick={handleRefresh}
          disabled={!isConnected || refreshing}
          className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
        >
          {refreshing ? '🔄' : '↻'} Refresh
        </button>
      </div>

      {!isConnected && (
        <div className="connection-warning">
          ⚠️ Not connected to server
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="no-rooms">
          <p>No rooms available</p>
          <p className="no-rooms-hint">Create a room to get started!</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <h4 className="room-name">{room.name}</h4>
                <div 
                  className={`room-stage ${room.stage}`}
                >
                  {getStageDisplay(room.stage)}
                </div>
              </div>
              
              <div className="room-info">
                <div className="player-count">
                  👥 {room.playerCount}/{room.maxPlayers} players
                </div>
                
                <div className="room-visibility">
                  {room.isPublic ? '🌐 Public' : '🔒 Private'}
                </div>
                
                <div className="room-code">
                  🎯 Code: {room.code}
                </div>

                <div className="room-settings">
                  🎮 {room.settings.numberOfLaps}L • {room.settings.numberOfDice}D • {room.settings.numberOfDecks}K • {room.settings.cardsPerHand}C • {room.settings.numberOfCoins}💰
                </div>
              </div>

              <button
                className="join-button"
                onClick={() => onJoinRoom(room.id)}
                disabled={!canJoinRooms || room.playerCount >= room.maxPlayers || room.stage === 'storm_rules'}
              >
                {!canJoinRooms ? 'Enter Name to Join' :
                 room.playerCount >= room.maxPlayers ? 'Room Full' : 
                 room.stage === 'storm_rules' ? 'Game In Progress' : 'Join Room'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
