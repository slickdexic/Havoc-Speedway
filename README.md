# 🏁 Havoc Speedway

A real-time multiplayer racing card game built with TypeScript, React, and WebSockets.

## 🎮 Features

### ✅ Professional Lobby System
- **Room Creation**: Host public or private games
- **Room Discovery**: Browse and join public rooms
- **Room Codes**: Join private games with 6-character codes
- **Auto-Complete**: Player and room name suggestions
- **Real-time Updates**: Live room list and player counts

### ✅ Game Mechanics
- **Dealer Selection**: Automated high-card dealer selection
- **Multi-stage Gameplay**: Dealer selection → Storm rules → Racing
- **Player Management**: Up to 4 players per room
- **Host Controls**: Room management and game flow

### ✅ Technical Architecture
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + TypeScript + WebSockets
- **Real-time Communication**: Bi-directional WebSocket messaging
- **Professional UI**: Dark gaming theme with responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Havoc-Speedway

# Install dependencies
npm install

# Start development servers
npm run dev
```

### Development Servers
- **Client**: http://localhost:3001 (Vite dev server)
- **Server**: ws://localhost:3003 (WebSocket server)

## 🏗️ Project Structure

```
Havoc-Speedway/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── Lobby.tsx
│   │   │   ├── RoomList.tsx
│   │   │   ├── CreateRoomForm.tsx
│   │   │   ├── JoinWithCode.tsx
│   │   │   └── AutoCompleteInput.tsx
│   │   ├── App.tsx         # Main application
│   │   └── App.css         # Styling
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── game/          # Game logic
│   │   │   ├── GameServer.ts
│   │   │   ├── GameState.ts
│   │   │   └── types/
│   │   ├── network/       # WebSocket handling
│   │   │   └── MessageHandler.ts
│   │   └── index.ts       # Server entry point
│   └── package.json
├── shared/                # Shared documentation
│   └── Havoc-Speedway-Reference.md
└── package.json          # Workspace root
```

## 🎯 Game Flow

1. **Lobby**: Players enter names and browse/create rooms
2. **Room Creation**: Host creates public/private room with settings
3. **Player Joining**: Players join via room list or room codes
4. **Dealer Selection**: Automated high-card selection
5. **Storm Rules**: Game rules phase
6. **Racing**: Main gameplay loop

## 🔧 Development

### Scripts
```bash
# Development (both client and server)
npm run dev

# Client only
npm run dev:client

# Server only  
npm run dev:server

# Build production
npm run build
```

### Architecture Decisions

#### Message Serialization
- **Problem**: Server GameState used Map objects, client expected arrays
- **Solution**: `serializeGameState()` method transforms Map → Array for JSON compatibility

#### Room Code System
- **Implementation**: 6-character codes derived from room IDs
- **Format**: Uppercase alphanumeric for easy sharing
- **Validation**: Client-side format checking with auto-uppercase

#### Professional UI
- **Design**: Dark gaming theme with glassmorphism effects
- **Layout**: Side-by-side "Create Room" and "Room Code" inputs
- **Responsive**: Mobile-friendly with flexible layouts

## 🐛 Known Issues

- **Port Conflicts**: Development server occasionally conflicts between 3001-3003
- **Room Persistence**: Rooms removed when all players disconnect
- **Error Handling**: Some edge cases in WebSocket reconnection

## 🚀 Recent Improvements

### v1.0.0 (Current)
- ✅ Fixed room creation blank screen issue
- ✅ Redesigned lobby layout (removed tabs, side-by-side inputs)
- ✅ Implemented room code system for private games
- ✅ Added professional dark gaming UI theme
- ✅ Fixed TypeScript interface mismatches
- ✅ Enhanced autocomplete functionality
- ✅ Improved WebSocket message handling

## 📋 TODO

- [ ] Resolve port conflict issues
- [ ] Implement full racing game mechanics
- [ ] Add player avatars and customization
- [ ] Enhance error handling and reconnection
- [ ] Add game replay system
- [ ] Implement spectator mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
