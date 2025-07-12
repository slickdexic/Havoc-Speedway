import { useState, useEffect } from 'react'
import './App.css'
import './styles/lobby-new.css'
import './styles/room.css'
import './styles/game.css'
import { LobbyNew } from './components/LobbyNew'
import { Room } from './components/Room'
import { GameRoom } from './components/GameRoom'
import type { GameSettings, Player } from '@havoc-speedway/shared';

interface GameState {
  stage: string;
  roomId: string;
  roomName: string;
  players: Player[];
  settings?: GameSettings;
  currentPlayerIndex?: number;
  dealerIndex?: number;
  dealerCards?: any[];
  message?: string;
  roundNumber?: number;
}

interface RoomInfo {
  id: string;
  name: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  isStarted: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  isPrivate: boolean;
  timestamp: number;
}

// Application States
type AppState = 'lobby' | 'room' | 'game';

function App() {
  // Core state
  const [appState, setAppState] = useState<AppState>('lobby');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerName, setPlayerName] = useState(() => {
    // Try to get name from sessionStorage first (unique per tab)
    const sessionName = sessionStorage.getItem('havoc-speedway-player-name');
    if (sessionName) return sessionName;
    
    // Try localStorage as fallback
    const savedName = localStorage.getItem('havoc-speedway-player-name');
    if (savedName) {
      // Add random suffix to make it unique for this tab
      const uniqueName = `${savedName}_${Math.floor(Math.random() * 100)}`;
      sessionStorage.setItem('havoc-speedway-player-name', uniqueName);
      return uniqueName;
    }
    
    // Generate completely new name
    const randomName = `Player${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('havoc-speedway-player-name', randomName);
    sessionStorage.setItem('havoc-speedway-player-name', randomName);
    return randomName;
  });
  
  // Lobby state
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  
  // Room state  
  const [currentRoom, setCurrentRoom] = useState<{
    name: string;
    players: Player[];
    settings: GameSettings;
    isHost: boolean;
    currentPlayerId: string;
  } | null>(null);
  
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Connection and setup
  useEffect(() => {
    // Get stored player name (prefer session storage for tab uniqueness)
    const sessionName = sessionStorage.getItem('havoc-speedway-player-name');
    const storedName = localStorage.getItem('havoc-speedway-player-name');
    if (sessionName) {
      setPlayerName(sessionName);
    } else if (storedName) {
      setPlayerName(storedName);
    }

    // Connect to WebSocket
    const websocket = new WebSocket('ws://localhost:3003');
    
    websocket.onopen = () => {
      console.log('Connected to server');
      setIsConnected(true);
      setWs(websocket);
      
      // Request room list
      websocket.send(JSON.stringify({ type: 'list_rooms' }));
    };

    websocket.onclose = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setWs(null);
      
      // Show connection status to user
      if (appState !== 'lobby') {
        alert('Connection lost. You will be returned to the lobby.');
        setAppState('lobby');
        setCurrentRoom(null);
        setGameState(null);
        setChatMessages([]);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    return () => {
      websocket.close();
    };
  }, []);

  const handleServerMessage = (message: any) => {
    console.log('Server message:', message);

    switch (message.type) {
      case 'room_list':
        setRooms(message.rooms || []);
        break;

      case 'room_joined':
        console.log('Joining room:', message);
        // Transition to room state
        setCurrentRoom({
          name: message.room.name,
          players: message.room.players,
          settings: message.room.settings,
          isHost: message.isHost,
          currentPlayerId: message.playerId
        });
        setAppState('room');
        setChatMessages([]);
        break;

      case 'room_updated':
        console.log('Room updated:', message);
        setCurrentRoom(prevRoom => {
          console.log('Current room before update:', prevRoom);
          if (prevRoom) {
            const updatedRoom = {
              ...prevRoom,
              players: message.room.players,
              settings: message.room.settings
            };
            console.log('Setting room to:', updatedRoom);
            return updatedRoom;
          } else {
            console.log('No current room - ignoring room_updated');
            return prevRoom;
          }
        });
        break;

      case 'game_started':
        console.log('Game started:', message);
        // Transition to game state
        setGameState(message.gameState);
        setAppState('game');
        break;

      case 'game_state_updated':
        console.log('Game state updated:', message);
        if (appState === 'game') {
          setGameState(message.gameState);
        }
        break;

      case 'message_received':
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: message.sender,
          content: message.content,
          isPrivate: message.isPrivate || false,
          timestamp: Date.now()
        };
        setChatMessages(prev => [...prev, newMessage]);
        break;

      case 'name_changed':
        console.log('Name changed:', message);
        setPlayerName(message.newName);
        localStorage.setItem('havoc-speedway-player-name', message.newName);
        sessionStorage.setItem('havoc-speedway-player-name', message.newName);
        break;

      case 'player_left':
        console.log('Player left:', message);
        if (appState === 'room' && currentRoom) {
          setCurrentRoom({
            ...currentRoom,
            players: currentRoom.players.filter(p => p.id !== message.playerId)
          });
        }
        break;

      case 'room_left':
        console.log('Left room successfully');
        // Already handled by handleLeaveRoom, just confirm
        break;

      case 'kicked':
        console.log('Kicked from room');
        // Return to lobby
        setAppState('lobby');
        setCurrentRoom(null);
        setGameState(null);
        setChatMessages([]);
        alert('You have been kicked from the room.');
        break;

      case 'error':
        console.error('Server error:', message.error);
        // Show error to user
        alert(`Error: ${message.error || 'Unknown error'}`);
        break;

      default:
        console.log('Unhandled message type:', message.type);
    }
  };

  const sendMessage = (message: any) => {
    if (ws && isConnected) {
      console.log('Sending message:', message);
      ws.send(JSON.stringify(message));
    } else {
      console.error('Cannot send message: not connected to server');
      alert('Not connected to server. Please refresh the page.');
    }
  };

  // Lobby handlers
  const handleCreateRoom = (roomName: string) => {
    let currentPlayerName = playerName;
    
    if (!currentPlayerName.trim()) {
      const name = prompt('Please enter your name:');
      if (!name?.trim()) return;
      currentPlayerName = name.trim();
      setPlayerName(currentPlayerName);
      localStorage.setItem('havoc-speedway-player-name', currentPlayerName);
      sessionStorage.setItem('havoc-speedway-player-name', currentPlayerName);
    }

    sendMessage({
      type: 'create_room',
      roomName,
      playerName: currentPlayerName,
      isPublic: true,
      settings: {
        numberOfLaps: 3,
        numberOfDice: 1,
        numberOfDecks: 1,
        cardsPerHand: 4,
        numberOfCoins: 2
      }
    });
  };

  const handleJoinRoom = (roomId: string) => {
    let currentPlayerName = playerName;
    
    if (!currentPlayerName.trim()) {
      const name = prompt('Please enter your name:');
      if (!name?.trim()) return;
      currentPlayerName = name.trim();
      setPlayerName(currentPlayerName);
      localStorage.setItem('havoc-speedway-player-name', currentPlayerName);
      sessionStorage.setItem('havoc-speedway-player-name', currentPlayerName);
    }

    sendMessage({
      type: 'join_room',
      roomId,
      playerName: currentPlayerName
    });
  };

  const handleRefreshRooms = () => {
    sendMessage({ type: 'list_rooms' });
  };

  const handleChangeName = (newName: string) => {
    if (!newName.trim()) return;
    sendMessage({ 
      type: 'change_name', 
      newName: newName.trim() 
    });
  };

  // Room handlers
  const handleLeaveRoom = () => {
    sendMessage({ type: 'leave_room' });
    setAppState('lobby');
    setCurrentRoom(null);
    setGameState(null);
    setChatMessages([]);
    
    // Refresh room list
    handleRefreshRooms();
  };

  const handleStartGame = () => {
    sendMessage({ type: 'start_game' });
  };

  const handleKickPlayer = (playerId: string) => {
    sendMessage({ 
      type: 'kick_player', 
      playerId 
    });
  };

  const handleChangeSettings = (settings: GameSettings) => {
    sendMessage({ 
      type: 'change_settings', 
      settings 
    });
  };

  const handleChangeColor = (color: string) => {
    sendMessage({ 
      type: 'change_color', 
      color 
    });
  };

  const handleSendMessage = (message: string, isPrivate: boolean, targetPlayerId?: string) => {
    sendMessage({ 
      type: 'send_message', 
      content: message,
      isPrivate,
      targetPlayerId
    });
  };

  const handlePlayerAction = (action: any) => {
    sendMessage({
      type: 'player_action',
      action
    });
  };

  // Render based on current app state
  switch (appState) {
    case 'lobby':
      return (
        <LobbyNew
          playerName={playerName}
          isConnected={isConnected}
          rooms={rooms}
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
          onRefreshRooms={handleRefreshRooms}
          onChangeName={handleChangeName}
        />
      );

    case 'room':
      if (!currentRoom) {
        return <div>Loading room...</div>;
      }
      
      return (
        <Room
          roomName={currentRoom.name}
          players={currentRoom.players}
          currentPlayerId={currentRoom.currentPlayerId}
          isHost={currentRoom.isHost}
          settings={currentRoom.settings}
          onLeaveRoom={handleLeaveRoom}
          onStartGame={handleStartGame}
          onKickPlayer={handleKickPlayer}
          onChangeSettings={handleChangeSettings}
          onChangeColor={handleChangeColor}
          onSendMessage={handleSendMessage}
          onChangeName={handleChangeName}
          chatMessages={chatMessages}
        />
      );

    case 'game':
      if (!gameState || !currentRoom) {
        return <div>Loading game...</div>;
      }

      // Use the stored current player ID from the room state
      const currentPlayerId = currentRoom.currentPlayerId;
      const isHost = currentRoom.isHost;

      return (
        <div className="game-app">
          <div className="game-header">
            <div className="game-title-section">
              <h1>🏁 Havoc Speedway</h1>
              <div className="game-info">
                <span className="room-name">{gameState.roomName}</span>
                <div className="stage-indicator">
                  <span className="stage-name">{getStageDisplayName(gameState.stage)}</span>
                  {(gameState.roundNumber || 0) > 0 && (
                    <span className="round-indicator">Round {gameState.roundNumber}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="game-controls">
              <button 
                onClick={handleLeaveRoom}
                className="btn btn-danger"
              >
                🚪 Leave Game
              </button>
            </div>
          </div>
          
          <div className="game-content">
            <GameRoom
              gameState={gameState}
              currentPlayerId={currentPlayerId}
              isHost={isHost}
              onLeaveRoom={handleLeaveRoom}
              onStartGame={handleStartGame}
              onKickPlayer={handleKickPlayer}
              onChangeSettings={handleChangeSettings}
              onSendMessage={handleSendMessage}
              onChangeColor={handleChangeColor}
              onPlayerAction={handlePlayerAction}
              chatMessages={chatMessages}
            />
          </div>
        </div>
      );

    default:
      return <div>Unknown application state</div>;
  }
}

// Helper function for stage display names
function getStageDisplayName(stage: string): string {
  switch (stage) {
    case 'waiting': return 'Waiting for Players';
    case 'dealer-selection': return 'Dealer Selection';
    case 'storm': return 'Storm Phase';
    case 'lane-selection': return 'Lane Selection';
    case 'coin': return 'Coin Placement';
    case 'racing': return 'Racing';
    default: return stage;
  }
}

export default App
