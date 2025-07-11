# Havoc Speedway - Development Build List

**Version**: 1.2  
**Reference Document**: Havoc-Speedway-Reference_V07.md (with user edits incorporated)  
**Last Updated**: December 2024

This comprehensive checklist breaks down the development of Havoc Speedway into manageable tasks organized by system and priority. Check off items as they are completed.

---

## 🏗️ **Foundation & Architecture**

### Core Framework
- [ ] **Project Setup**
  - [ ] Initialize project structure (client/server/shared)
  - [ ] Set up build system and dependencies
  - [ ] Configure development environment
  - [ ] Set up version control and branching strategy

- [ ] **Networking Architecture**
  - [ ] Design client-server communication protocol
  - [ ] Implement room management system
  - [ ] Create real-time synchronization framework
  - [ ] Set up message queuing and event handling

- [ ] **Game State Management**
  - [ ] Design central game state architecture
  - [ ] Implement state transitions between game stages
  - [ ] Create state validation and synchronization
  - [ ] Build state persistence for reconnection handling

---

## 🎮 **Core Game Systems**

### Card Game Engine (Storm Rules)
- [ ] **Card Deck System**
  - [ ] Create Card class with rank, suit, and properties
  - [ ] Implement single deck (32 cards) functionality
  - [ ] Implement double deck (64 cards) functionality
  - [ ] Create deck shuffling and randomization

- [ ] **Card Game Logic**
  - [ ] Implement Ace skip-turn functionality
  - [ ] Implement Queen wild card system with suit calling
  - [ ] Implement Seven toxic stacking system (2+2+2...)
  - [ ] Create card validation (suit/rank matching)
  - [ ] Handle special cases (Queen on toxic 7 restriction)

- [ ] **Card Dealing System**
  - [ ] Implement clockwise dealing order
  - [ ] Handle variable cards per player (3-5, host configured)
  - [ ] Create initial discard pile setup
  - [ ] Handle special initial cards (Queen calls bottom suit, 7 starts toxic)

- [ ] **Turn Management**
  - [ ] Implement turn order (player after dealer starts)
  - [ ] Handle Ace skip exceptions
  - [ ] Manage turn progression and validation
  - [ ] Track finishing order (1st, 2nd, 3rd, 4th badges)

### Racing Engine
- [ ] **Track System**
  - [ ] **Load coordinate system from TrackCoordinates.csv**
  - [ ] **Implement precise X,Y positioning for all 96 positions × 4 lanes**
  - [ ] **Create track renderer using coordinate data (counterclockwise racing direction)**
  - [ ] **Map coordinate positions to track segments:**
    - [ ] Right straight (positions 96, 1-5): X=14.4174 (Lane 1), travelling north
    - [ ] First corner (positions 6-19): Northeast curve
    - [ ] Top straight (positions 20-29): Y=14.4174 (Lane 1), travelling west
    - [ ] Second corner (positions 30-43): Northwest curve
    - [ ] Left straight (positions 44-53): X=-14.4174 (Lane 1), travelling south
    - [ ] Third corner (positions 54-67): Southwest curve
    - [ ] Bottom straight (positions 68-77): Y=-14.4174 (Lane 1), travelling east
    - [ ] Fourth corner (positions 78-91): Southeast curve
    - [ ] Final straight (positions 92-96): North to finish line
  - [ ] **Implement lane spacing system (1.0 unit between lanes)**
  - [ ] **Implement lane structure with different corner radii:**
    - [ ] Lane 1 (Inside): Straights distance ≈14.4174, corner radius ≈9.4174
    - [ ] Lane 2: Straights distance ≈15.4174, corner radius ≈10.4174
    - [ ] Lane 3: Straights distance ≈16.4174, corner radius ≈11.4174
    - [ ] Lane 4 (Outside): Straights distance ≈17.4174, corner radius ≈12.4174
  - [ ] **Create start/finish line at X=14.4174, Y=0.0 (between positions 96/1)**

- [ ] **Movement System**
  - [ ] Implement standard die movement (1 or 2 dice per host setting)
  - [ ] Implement lane-change die system (L1, R1, L2, R2, Check Engine)
  - [ ] Create obstruction detection (cars cannot be jumped)
  - [ ] Handle "one car per space" rule
  - [ ] Implement landing vs. traveling through spaces logic

- [ ] **Pit System**
  - [ ] **Create pit area coordinates (4 positions at X=12.0):**
    - [ ] Pit Position 1: X=12.0, Y=0.7
    - [ ] Pit Position 2: X=12.0, Y=1.9
    - [ ] Pit Position 3: X=12.0, Y=3.1
    - [ ] Pit Position 4: X=12.0, Y=4.3
  - [ ] **Create pit-lane coordinates (5 positions at X=13.4174):**
    - [ ] Pit-Lane Position 1: X=13.4174, Y=0.5 (adjacent to Lane 1 Position 1)
    - [ ] Pit-Lane Position 2: X=13.4174, Y=1.5 (adjacent to Lane 1 Position 2)
    - [ ] Pit-Lane Position 3: X=13.4174, Y=2.5 (adjacent to Lane 1 Position 3)
    - [ ] Pit-Lane Position 4: X=13.4174, Y=3.5 (adjacent to Lane 1 Position 4)
    - [ ] Pit-Lane Position 5: X=13.4174, Y=4.5 (adjacent to Lane 1 Position 5)
  - [ ] Implement pit entry triggers (Tow-to-Pit coin, wall crashes)
  - [ ] Implement pit-lane exit rules (R1/R2 to merge)
  - [ ] Handle pit-lane wall collision detection

- [ ] **Coin System**
  - [ ] Create 90-coin system with proper distribution (+2×16, +3×12, etc.)
  - [ ] Implement coin placement restrictions (no pit areas, 6-space buffer)
  - [ ] Create coin triggering on landing (not traveling through)
  - [ ] Implement chain reactions and coin removal
  - [ ] Handle coin visibility (owner sees value, others see face-down)

### Dice System
- [ ] **Dice Engine**
  - [ ] Create standard 6-sided die (1-6)
  - [ ] Create lane-change die (L1, R1, Check Engine, L2, R2, Check Engine)
  - [ ] Implement dice rolling animations and randomization
  - [ ] Handle dice configuration rules (host sets, pit always 1 die)

---

## 🎯 **Game Stages Implementation**

### 1. Dealer Selection Stage
- [ ] **UI Implementation**
  - [ ] Create 3×6 face-down card grid display
  - [ ] Implement card flip animation (0.5 seconds)
  - [ ] Create card movement to player cards
  - [ ] Add dealer button drop animation

- [ ] **Logic Implementation**
  - [ ] Handle turn-based card selection (room seat order)
  - [ ] Implement lowest card wins (7 low, Ace high)
  - [ ] Handle tie resolution (re-selection)
  - [ ] Advance to Storm stage after 1.0 second delay

### 2. Storm Stage (Card Game)
- [ ] **UI Implementation**
  - [ ] Create Storm stage layout (cards top, piles middle, hand bottom)
  - [ ] Implement card dealing animations (0.3 seconds per card)
  - [ ] Create fanned card SVG display with count overlay
  - [ ] Implement active player card scaling (1.4× zoom)

- [ ] **Interactive Elements**
  - [ ] Create playable card highlighting and click handling
  - [ ] Implement Queen suit selection chat bubble interface
  - [ ] Create toxic 7 visual feedback (pile color change, "Draw N" text)
  - [ ] Add finishing badges (1st, 2nd, 3rd, 4th) placement

- [ ] **Game Logic Integration**
  - [ ] Connect card engine to UI
  - [ ] Implement turn validation and progression
  - [ ] Handle special card effects in UI
  - [ ] Track and display winning order

### 3. Lane Selection Stage
- [ ] **UI Implementation**
  - [ ] Create track view with dashed circles at position 96
  - [ ] Disable pan & zoom, center view on position 96
  - [ ] Implement lane selection interface
  - [ ] Show Storm winning order for selection priority

- [ ] **Logic Implementation**
  - [ ] Validate lane selection (one per lane at position 96)
  - [ ] Track selection order based on Storm results
  - [ ] Advance to Coin Stage after all selections

### 4. Coin Stage
- [ ] **UI Implementation**
  - [ ] Display drawn coins on player cards (face-up to owner, face-down to others)
  - [ ] Implement coin selection with glow effect
  - [ ] Create track placement interface with restriction visualization
  - [ ] Show coin values on track (owner only)

- [ ] **Logic Implementation**
  - [ ] Implement coin distribution based on Storm results
  - [ ] Handle placement restrictions (pit areas, 6-space buffer)
  - [ ] Validate coin placement
  - [ ] Track coin ownership and placement

### 5. Racing Stage
- [ ] **UI Implementation**
  - [ ] Display rolled dice on player cards
  - [ ] Implement movement animations with camera following
  - [ ] Create obstruction and landing visualization
  - [ ] Handle chain reaction coin triggering animations

- [ ] **Logic Implementation**
  - [ ] Connect movement engine to UI
  - [ ] Handle die choice (movement vs. lane-change)
  - [ ] Process movement, obstructions, and coin effects
  - [ ] Track lap completion and race finishing

---

## 💻 **User Interface Systems**

### Player Cards System
- [ ] **Core Components**
  - [ ] Create player card layout framework
  - [ ] Implement player name display (centered above middle)
  - [ ] Create pawn graphic system (player colors)
  - [ ] Add lap number display (top-right, after racing starts)

- [ ] **Dynamic Elements**
  - [ ] Implement dealer button animation and passing
  - [ ] Create winning order badges (top-left, clear previous)
  - [ ] Build card-in-hand SVG display with count overlay
  - [ ] Add dice result display (bottom of card)

- [ ] **Visual States**
  - [ ] Create active player highlighting (thick border, unique background)
  - [ ] Implement consistent color schemes and fonts
  - [ ] Handle stage-specific element visibility

### Track View System
- [ ] **Camera Controls**
  - [ ] Implement pan with left mouse button and drag
  - [ ] Create zoom with mouse wheel (zoom to cursor)
  - [ ] Handle pan & zoom disable during lane selection
  - [ ] Implement movement following camera (disable controls, follow pawn)

- [ ] **Track Rendering**
  - [ ] Create track visualization from layout references
  - [ ] Implement position numbering (1-96)
  - [ ] Render lane markings and boundaries
  - [ ] Add pit and pit-lane visualization

- [ ] **Interactive Elements**
  - [ ] Create coin placement interface
  - [ ] Implement selection highlighting
  - [ ] Add restriction visualization (grayed areas)
  - [ ] Handle click detection on track positions

### Special UI Elements
- [ ] **Queen Play Interface**
  - [ ] Create chat bubble on left side of played Queen
  - [ ] Implement four suit symbol selection (no text)
  - [ ] Display result (Q and suit in corner, large suit in middle)
  - [ ] Ensure no obstruction of hand or deck

- [ ] **Toxic 7 Interface**
  - [ ] Change stock pile to toxic color
  - [ ] Update draw text ("Draw 2", "Draw 4", etc.)
  - [ ] Handle multiple toxic 7 stacking

- [ ] **Stage Transitions**
  - [ ] Create results popup after stage completion
  - [ ] Implement "Continue to [Next Stage]" host button
  - [ ] Show "Waiting for host" message for other players

---

## 🌐 **Lobby and Networking**

### Lobby System
- [ ] **Room Management**
  - [ ] Create "Host" button and room creation flow
  - [ ] Implement room name text box (required)
  - [ ] Display room list with details (name, host, players, status, settings)
  - [ ] Handle room capacity (4 players max)

- [ ] **Game Settings**
  - [ ] Create host configuration interface
  - [ ] Implement settings: laps (1-5), dice (1-2), decks (1-2), cards (3-5), coins (1-3)
  - [ ] Display settings in room list
  - [ ] Validate and apply settings to game

- [ ] **Player Management**
  - [ ] Assign players to slots (host always slot 1)
  - [ ] Implement auto-assigned random colors from available set
  - [ ] Create color change button (pick from unassigned colors)
  - [ ] Add host kick functionality

- [ ] **Messaging System**
  - [ ] Create private message interface (player-to-player)
  - [ ] Implement room chat (message to all)
  - [ ] Display chat window with message history
  - [ ] Add message symbols (private vs. general indicators)

### Networking Implementation
- [ ] **Connection Management**
  - [ ] Handle player connections and disconnections
  - [ ] Implement reconnection system
  - [ ] Create session persistence
  - [ ] Handle network timeout scenarios

- [ ] **Real-time Synchronization**
  - [ ] Synchronize game state across all clients
  - [ ] Handle concurrent actions and conflict resolution
  - [ ] Implement lag compensation
  - [ ] Create authoritative server validation

---

## 🎨 **Animation and Timing**

### Dealer Selection Animations
- [ ] **Card Dealing**
  - [ ] Create 18-card dealing animation (3×6 grid)
  - [ ] Implement card flip on click (0.5 seconds)
  - [ ] Create card movement to player card (shrinking effect)
  - [ ] Add dealer button drop animation

- [ ] **Transitions**
  - [ ] Implement 1.0 second delay before Storm stage
  - [ ] Create smooth stage transition effects

### Storm Stage Animations
- [ ] **Card Interactions**
  - [ ] Create card dealing to hand animation (0.3 seconds per card)
  - [ ] Implement active player card growth (1.4× without overlap)
  - [ ] Create legal card animation to discard pile
  - [ ] Add finishing badge placement animations

- [ ] **Special Effects**
  - [ ] Queen suit selection chat bubble animation
  - [ ] Toxic 7 pile color change effect
  - [ ] Card count SVG updates during dealing

### Movement Animations
- [ ] **Pawn Movement**
  - [ ] Create smooth pawn movement along track
  - [ ] Implement camera following during movement
  - [ ] Handle obstruction stopping animations
  - [ ] Create coin triggering effect animations

- [ ] **Camera Control**
  - [ ] Smooth pan and zoom transitions
  - [ ] Movement focus mode (disable controls, follow pawn)
  - [ ] Restore controls when next player rolling

---

## 🔧 **Technical Infrastructure**

### Data Management
- [ ] **Game State Persistence**
  - [ ] Design save/load system for game state
  - [ ] Implement player reconnection data
  - [ ] Create game history tracking
  - [ ] Handle state validation and error recovery

- [ ] **Asset Management**
  - [ ] Load and manage card graphics
  - [ ] Handle track layout assets (SVG, DXF, PNG references)
  - [ ] Optimize asset loading and caching
  - [ ] Implement responsive asset scaling

### Performance Optimization
- [ ] **Rendering Optimization**
  - [ ] Optimize track rendering for smooth pan/zoom
  - [ ] Implement efficient animation systems
  - [ ] Create object pooling for cards and coins
  - [ ] Handle large player counts efficiently

- [ ] **Network Optimization**
  - [ ] Minimize network traffic with delta updates
  - [ ] Implement message compression
  - [ ] Create efficient state synchronization
  - [ ] Handle bandwidth adaptation

---

## 🧪 **Testing and Quality Assurance**

### Unit Testing
- [ ] **Core Systems Testing**
  - [ ] Test card game logic (all special rules)
  - [ ] Test movement system (obstruction, coins, pit)
  - [ ] Test dice system (both types, all configurations)
  - [ ] Test track position system

- [ ] **UI Component Testing**
  - [ ] Test player card functionality
  - [ ] Test track view interactions
  - [ ] Test animation systems
  - [ ] Test lobby functionality

### Integration Testing
- [ ] **Game Flow Testing**
  - [ ] Test complete game sequence (all 5 stages)
  - [ ] Test stage transitions
  - [ ] Test error handling and edge cases
  - [ ] Test multiplayer synchronization

- [ ] **Network Testing**
  - [ ] Test connection stability
  - [ ] Test reconnection scenarios
  - [ ] Test concurrent player actions
  - [ ] Test performance under load

### User Experience Testing
- [ ] **Usability Testing**
  - [ ] Test game comprehension for new players
  - [ ] Test UI clarity and responsiveness
  - [ ] Test accessibility features
  - [ ] Test mobile/desktop compatibility

---

## 📋 **Documentation and Deployment**

### Documentation
- [ ] **Code Documentation**
  - [ ] Document API and architecture
  - [ ] Create developer setup guide
  - [ ] Document configuration options
  - [ ] Create troubleshooting guide

- [ ] **User Documentation**
  - [ ] Create player tutorial/onboarding
  - [ ] Document game rules and UI
  - [ ] Create FAQ and support materials

### Deployment
- [ ] **Production Setup**
  - [ ] Set up production servers
  - [ ] Configure monitoring and logging
  - [ ] Implement backup and recovery
  - [ ] Set up update deployment pipeline

- [ ] **Launch Preparation**
  - [ ] Conduct final testing
  - [ ] Prepare launch communications
  - [ ] Set up user feedback systems
  - [ ] Plan post-launch support

---

## 🎯 **Priority Levels**

**🔴 Critical (Must Complete First)**
- Foundation & Architecture
- Core Game Systems (Card Engine, Racing Engine)
- Basic Game Stages (1-5)
- Lobby System

**🟡 High Priority**
- User Interface Systems
- Animation and Timing
- Networking Implementation

**🟢 Medium Priority**
- Advanced Features
- Performance Optimization
- Comprehensive Testing

**🔵 Nice to Have**
- Advanced UI Polish
- Additional Features
- Extended Documentation

---

**Total Tasks**: 200+ individual items  
**Estimated Development Time**: 6-12 months (depending on team size)  
**Completion Progress**: 0% ◻️◻️◻️◻️◻️◻️◻️◻️◻️◻️

---

*This checklist is based on Havoc-Speedway-Reference_V06.md and will be updated as requirements evolve.*
