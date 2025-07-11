import { useState } from 'react';
import { AutoCompleteInput } from './AutoCompleteInput';

interface CreateRoomFormProps {
  onCreateRoom: (roomName: string, isPublic: boolean) => void;
  isCreating: boolean;
}

export function CreateRoomForm({ onCreateRoom, isCreating }: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onCreateRoom(roomName.trim(), isPublic);
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
