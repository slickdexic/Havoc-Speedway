import { useState } from 'react';
import { AutoCompleteInput } from './AutoCompleteInput';
import type { GameSettings } from '@havoc-speedway/shared';

interface CreateRoomFormProps {
  onCreateRoom: (roomName: string, isPublic: boolean, settings: GameSettings) => void;
  isCreating: boolean;
}

export function CreateRoomForm({ onCreateRoom, isCreating }: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [settings, setSettings] = useState<GameSettings>({
    numberOfLaps: 2,
    numberOfDice: 1,
    numberOfDecks: 1,
    cardsPerHand: 5,
    numberOfCoins: 2
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onCreateRoom(roomName.trim(), isPublic, settings);
      // Save to autocomplete history
      const storageKey = 'havoc-speedway-room-names';
      const stored = localStorage.getItem(storageKey);
      let history: string[] = [];
      if (stored) {
        try {
          history = JSON.parse(stored);
        } catch (e) {
          history = [];
        }
      }
      const updated = [roomName.trim(), ...history.filter(name => name !== roomName.trim())].slice(0, 5);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      setRoomName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-room-form">
      <h3>Create New Room</h3>
      
      <AutoCompleteInput
        label="Room Name"
        placeholder="Enter room name..."
        value={roomName}
        onChange={setRoomName}
        storageKey="havoc-speedway-room-names"
        disabled={isCreating}
      />

      <div className="room-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={isCreating}
          />
          <span className="checkbox-text">Public room (visible to all players)</span>
        </label>
      </div>

      <div className="game-settings">
        <h4>Game Settings</h4>
        
        <div className="settings-grid">
          <div className="setting-group">
            <label>Number of Laps</label>
            <select 
              value={settings.numberOfLaps} 
              onChange={(e) => setSettings(prev => ({ ...prev, numberOfLaps: Number(e.target.value) as 1|2|3|4|5 }))}
              disabled={isCreating}
            >
              <option value={1}>1 Lap</option>
              <option value={2}>2 Laps</option>
              <option value={3}>3 Laps</option>
              <option value={4}>4 Laps</option>
              <option value={5}>5 Laps</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Number of Dice</label>
            <select 
              value={settings.numberOfDice} 
              onChange={(e) => setSettings(prev => ({ ...prev, numberOfDice: Number(e.target.value) as 1|2 }))}
              disabled={isCreating}
            >
              <option value={1}>1 Die</option>
              <option value={2}>2 Dice</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Number of Decks</label>
            <select 
              value={settings.numberOfDecks} 
              onChange={(e) => setSettings(prev => ({ ...prev, numberOfDecks: Number(e.target.value) as 1|2 }))}
              disabled={isCreating}
            >
              <option value={1}>1 Deck</option>
              <option value={2}>2 Decks</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Cards per Hand</label>
            <select 
              value={settings.cardsPerHand} 
              onChange={(e) => setSettings(prev => ({ ...prev, cardsPerHand: Number(e.target.value) as 3|4|5 }))}
              disabled={isCreating}
            >
              <option value={3}>3 Cards</option>
              <option value={4}>4 Cards</option>
              <option value={5}>5 Cards</option>
            </select>
          </div>

          <div className="setting-group">
            <label>Number of Coins</label>
            <select 
              value={settings.numberOfCoins} 
              onChange={(e) => setSettings(prev => ({ ...prev, numberOfCoins: Number(e.target.value) as 1|2|3 }))}
              disabled={isCreating}
            >
              <option value={1}>1 Coin</option>
              <option value={2}>2 Coins</option>
              <option value={3}>3 Coins</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!roomName.trim() || isCreating}
        className="create-room-button"
      >
        {isCreating ? 'Creating...' : 'Create Room'}
      </button>
    </form>
  );
}
