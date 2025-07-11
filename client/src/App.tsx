import { useState, useEffect } from 'react'
import './App.css'
import { Lobby } from './components/Lobby'

interface Player {
  id: string;
  name: string;
  color: string;
  isDealer?: boolean;
}

interface GameState {
  stage: string;
  roomId: string;
  roomName: string;
  players: Player[];
  currentPlayerIndex?: number;
  dealerIndex?: number;
  dealerCards?: any[];
  message?: string;
}

interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  stage: string;
  isPublic: boolean;
  code: string;
}

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved player name
    const saved = localStorage.getItem('havoc-speedway-current-player');
    if (saved) {
      setPlayerName(saved);
    }

    connectToServer();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const connectToServer = () => {
    try {
      const ws = new WebSocket('ws://localhost:3003');
      
      ws.onopen = () => {
        console.log('Connected to server');
        setIsConnected(true);
        setConnectionError(null);
        setSocket(ws);
        // Request room list immediately
        ws.send(JSON.stringify({ type: 'list_rooms' }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          
          switch (message.type) {
            case 'room_created':
              console.log('Room created:', message.roomId);
              // Refresh room list after creating
              ws.send(JSON.stringify({ type: 'list_rooms' }));
              break;
              
            case 'joined_room':
              console.log('Joined room:', message.roomId);
              setGameState(message.gameState);
              break;
              
            case 'game_state':
              console.log('Game state updated:', message.gameState);
              setGameState(message.gameState);
              break;

            case 'rooms_list':
              console.log('Rooms updated:', message.rooms);
              setRooms(message.rooms || []);
              break;
              
            case 'error':
              console.error('Server error:', message.error);
              setConnectionError(message.error);
              break;
              
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from server');
        setIsConnected(false);
        setSocket(null);
        // Try to reconnect after 3 seconds
        setTimeout(connectToServer, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection failed');
        setIsConnected(false);
      };
      
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionError('Failed to connect to server');
      setTimeout(connectToServer, 3000);
    }
  };

  const sendMessage = (message: any) => {
    console.log('Sending message:', message);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      console.log('Message sent successfully');
    } else {
      console.error('Socket not connected, readyState:', socket?.readyState);
    }
  };

  const handleJoinRoom = (name: string, roomId: string) => {
    setPlayerName(name);
    localStorage.setItem('havoc-speedway-current-player', name);
    sendMessage({
      type: 'join_room',
      roomId: roomId,
      playerName: name
    });
  };

  const handleJoinWithCode = (name: string, roomCode: string) => {
    console.log('handleJoinWithCode called with:', { name, roomCode });
    setPlayerName(name);
    localStorage.setItem('havoc-speedway-current-player', name);
    sendMessage({
      type: 'join_room_code',
      roomCode: roomCode,
      playerName: name
    });
  };

  const handleCreateRoom = (name: string, roomName: string, isPublic: boolean) => {
    console.log('handleCreateRoom called with:', { name, roomName, isPublic });
    setPlayerName(name);
    localStorage.setItem('havoc-speedway-current-player', name);
    sendMessage({
      type: 'create_room',
      roomName: roomName,
      playerName: name,
      isPublic: isPublic
    });
  };

  const handleRefreshRooms = () => {
    sendMessage({ type: 'list_rooms' });
  };

  const handleStartGame = () => {
    sendMessage({ type: 'start_game' });
  };

  const handleLeaveRoom = () => {
    sendMessage({ type: 'leave_room' });
    setGameState(null);
    // Refresh room list
    sendMessage({ type: 'list_rooms' });
  };

  // Show lobby if not in a game
  if (!gameState) {
    return (
      <div className="app">
        <Lobby
          playerName={playerName}
          isConnected={isConnected}
          rooms={rooms}
          onJoin={handleJoinRoom}
          onJoinWithCode={handleJoinWithCode}
          onCreate={handleCreateRoom}
          onRefreshRooms={handleRefreshRooms}
        />
        {connectionError && (
          <div className="error-message">
            {connectionError}
          </div>
        )}
      </div>
    );
  }

  // In-game view
  return (
    <div className="app">
      <div className="game-container">
        <div className="game-header">
          <h1>🏁 Havoc Speedway - {gameState.roomName}</h1>
          <button onClick={handleLeaveRoom} className="leave-room-button">
            Leave Room
          </button>
        </div>

        {connectionError && (
          <div className="error-message">
            {connectionError}
          </div>
        )}

        <div className="game-info">
          <div className="stage-info">
            <strong>Stage:</strong> {gameState.stage}
          </div>
          
          {gameState.message && (
            <div className="game-message">
              {gameState.message}
            </div>
          )}
        </div>

        <div className="players-section">
          <h3>Players ({gameState.players.length}/4)</h3>
          <div className="players-list">
            {gameState.players.map((player) => (
              <div 
                key={player.id} 
                className={`player-card ${player.isDealer ? 'dealer' : ''} color-${player.color}`}
              >
                <div className="player-name">
                  {player.name}
                  {player.isDealer && ' 👑'}
                </div>
                <div className={`player-color bg-${player.color}`}></div>
              </div>
            ))}
          </div>
        </div>

        {gameState.stage === 'waiting' && gameState.players.length >= 2 && (
          <div className="game-controls">
            <button onClick={handleStartGame} className="start-game-button">
              Start Game
            </button>
          </div>
        )}

        {gameState.dealerCards && gameState.dealerCards.length > 0 && (
          <div className="dealer-cards">
            <h3>Dealer Selection Cards</h3>
            <div className="cards-display">
              {gameState.dealerCards.map((card: any, index: number) => (
                <div key={index} className="card">
                  {card.rank} of {card.suit}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
