# Havoc Speedway

**Game Design Reference Document - Version 6.0**

## Table of Contents
1. [Storm Rules (Card Game)](#storm-rules)
2. [Game Flow Overview](#game-flow-overview)
3. [Detailed Stage Descriptions](#detailed-stage-descriptions)
4. [Racing Mechanics](#racing-mechanics)
5. [User Interface Design](#user-interface-design)
6. [Game Lobby and Setup](#game-lobby-and-setup)
7. [Track Layout and Position System](#track-layout-and-position-system)
8. [Animation and Timing Specifications](#animation-and-timing-specifications)

---

## Storm Rules

*Card game based on Prsi, similar to Crazy 8s*

### Card Deck
- **Ranks Used**: 7, 8, 9, 10, J, Q, K, A (all four suits: hearts, diamonds, spades, clubs)
- **Single Deck**: 32 cards (8 ranks × 4 suits)
- **Game Options**: Single deck (32 cards) or double deck (64 cards)
  - **Two-deck implications**: More uncertainty with additional 7s, Queens, and Aces. Potential for longer rounds.

### Special Card Rules

#### Aces
- **Effect**: Skip the next player's turn

#### Queens
- **Effect**: Wild card that can be played on any card **except** a toxic 7
- **Requirement**: Player must call a suit when playing a Queen (unless the Queen finishes the Storm round)

#### Sevens (Toxic Cards)
- **Effect**: Next player must either:
  - Play another 7, OR
  - Draw 2 cards (plus 2 for each stacked 7)
- **Stacking**: Each 7 played on a toxic 7 adds 2 to the draw requirement
- **Reset**: Once a player draws cards, the 7 is no longer toxic
- **Important**: Any 7 played on a non-toxic 7 creates a new single toxic 7 (draw 2)

### Dealing and Setup

1. **Dealing Order**: Clockwise, starting with the player after the dealer
2. **Cards Per Player**: 3-5 cards (set by host before game)
3. **Initial Setup**:
   - **Deal cards face down to each player**: One card per player at a time, in clockwise order, until each player has the correct number of cards
   - Turn over one card to start the discard pile
   - Place remaining cards as the stock pile

#### Special Initial Card Rules
- **Queen as first card**: Queen calls the suit of the bottom card in the deck
- **7 as first card**: Considered toxic immediately (next player must play 7 or draw 2)

### Gameplay Rules

#### Turn Order
- **First Player**: Player after the dealer (clockwise)
- **Exception**: If first card is an Ace, the first player is skipped

#### Valid Plays
Players must play a card that matches either:
- **Suit** of the top discard card, OR
- **Rank** of the top discard card
- **Exception**: If a Queen changes the suit, the played Queen assumes the called suit

#### Special Situations
- **Toxic 7 Active**: Player can only play another 7 or draw required cards
- **Non-toxic Situations**: Player may play a Queen as wild card and call suit
- **Drawing Rule**: Unlike Crazy 8s, players cannot play immediately after drawing - turn ends

#### Winning and Turn Order
1. **First to empty hand**: Receives "1st" badge
2. **Remaining players**: Continue until all have finishing positions (1st, 2nd, 3rd, 4th)
3. **Two-player endgame**: If a player finishes with a Queen, no suit call needed
4. **Next Storm round**: Dealer button advances clockwise

---

## Game Flow Overview

### Complete Game Sequence
1. **Dealer Selection Stage** *(Once per game)*
2. **Storm Stage** *(Repeated each round)*
3. **Lane Selection Stage** *(Once per game, after first Storm)*
4. **Coin Stage** *(Repeated each round)*
5. **Racing Stage** *(Repeated each round)*

---

## Detailed Stage Descriptions

### 1. Dealer Selection Stage
*Occurs once at game start*

#### Process
- **Display**: 18 face-down cards in 3 rows of 6 cards (from a randomly shuffled deck)
- **Selection**: Players take turns (by room seat order) selecting one card
- **Dealer Determination**: Player with lowest card becomes dealer (7 low, Ace high)
- **Tie Resolution**: Tied players select again until tie is broken
- **Result**: Selected dealer receives dealer button for first Storm stage

### 2. Storm Stage
*Card game using rules above*

#### Objectives
- First player to discard all cards wins the round
- All players receive finishing order badges (1st, 2nd, 3rd, 4th)
- Winning order determines turn priority for subsequent stages

### 3. Lane Selection Stage
*Occurs once after first Storm stage*

#### Process
- Players select starting lanes in Storm winning order
- **Track Position**: All players start at position 96 (one of four available pole positions)
- **Interface**: Dashed circles indicate selectable positions
- **Pan & Zoom**: Disabled during lane selection, view zoomed and panned (focused) on position 96
- **Timing**: After lane selection, game proceeds to Coin Stage

### 4. Coin Stage
*Occurs before each Racing Stage*

#### Coin Distribution
Based on previous Storm winning order:
- **1st Place**: N coins (host-configured: 1-3)
- **2nd Place**: N-1 coins (minimum 0)
- **3rd Place**: N-2 coins (minimum 0)
- **4th Place**: 0 coins

#### Coin Placement Rules
- Players place all awarded coins in Storm winning order
- **Restrictions**:
  - No coins in pit or pit-lane areas
  - No coins in 6 spaces directly in front of other players' pawns (grayed out during placement)
- **Process**: Each player places all their coins on their turn

#### Coin Values (90 total coins randomly mixed in coin purse)
- **+2** (16 coins) - Move forward 2 spaces
- **+3** (12 coins) - Move forward 3 spaces  
- **+4** (8 coins) - Move forward 4 spaces
- **+5** (6 coins) - Move forward 5 spaces
- **-2** (16 coins) - Move backward 2 spaces
- **-3** (12 coins) - Move backward 3 spaces
- **-4** (8 coins) - Move backward 4 spaces
- **-5** (6 coins) - Move backward 5 spaces
- **Tow-to-Pit** (6 coins) - Sent to pit (no lap credit)

---

## Racing Mechanics

### Movement Options
Players choose one of two types of dice each turn:

#### Option 1: Movement Die (Standard 6-sided die)
**OR Two Dice** *(If host-configured two-dice game setting is enabled)*

**Movement Rules:**
- Cars cannot be jumped over (they are obstructions)
- Only one car per space
- If obstructed, land on last available space before obstruction
- Pawn moves forward the rolled amount or until obstructed
- **Important**: Pawns travel across spaces until they "land on" a space - coins merely traveled across are not triggered

**Landing on Coins:**
- Coin is revealed and effect applied immediately
- Coin-induced movement follows same obstruction rules
- **Chain reactions**: If coin-induced movement lands on another coin, that coin activates
- **No infinite loops**: Coins are removed from track when triggered
- **No reaction limit**: Chain reactions continue until no more coins are triggered

#### Option 2: Lane-Change Die (6-sided die)
**Directional Reference**: Left = towards inside lane, Right = towards outside lane

**Die Faces:**
- **Face 1**: L1 - Move one lane left (towards inside) if not obstructed by wall or pawn
- **Face 2**: R1 - Move one lane right (towards outside) if not obstructed by wall or pawn
- **Face 3**: Check Engine symbol - Turn ends
- **Face 4**: L2 - Move up to two lanes left (as far as possible, up to two spaces)
- **Face 5**: R2 - Move up to two lanes right (as far as possible, up to two spaces)
- **Face 6**: Check Engine symbol - Turn ends

**Lane Change Rules:**
- Movement blocked by walls or other pawns
- Move as far as possible (up to maximum for roll)
- Lane changes onto pit-lane are possible and permitted
- Landing on pit-lane results in pit-lane rules applying on player's next turn

### Pit System

#### Pit vs. Pit-Lane Distinction
- **Pit**: Starting area when sent there (separate from main track)
- **Pit-Lane**: 5-space corridor for exiting pit back to main track

#### Entering the Pit
**Triggers:**
- Tow-to-Pit coin effect
- Crash into pit-lane end wall (e.g., roll a 6 from the pit)

#### Pit Rules
**From Pit:**
- Must roll one standard die (even if playing with two-dice variant) to advance to pit-lane
- **Pit-lane spaces**: Only 5 available
- **Rolling 6**: Crashes into pit-lane wall, sent back to pit
- **Pit-lane Order**: Entering pit-lane from the pit begins at pit-lane spot 1 which is left of Lane 1 spot 1

#### Pit-Lane Rules
**Once on pit-lane, in any pit-lane space:**

**Die Choice:**
- Can choose standard die OR lane-change die
- **Restriction**: If space directly to the right is obstructed by a pawn, must use standard die (risk colliding with pit-lane wall)

**Lane-Change Die Results:**
- **R1 or R2**: Can merge onto main track (standard obstruction and coin rules apply)
- **Any other result**: Turn ends

**Standard Die Results:**
- Normal forward movement within pit-lane
- Risk hitting pit-lane wall if roll would exceed available spaces (sent back to pit)

### Race Completion
- **Finish Condition**: Cross finish line on final lap
- **End of Round**: All players complete their racing stage after first finisher
- **Single Winner**: If only one player finishes, they win and game ends
- **Multiple Finishers**: Player who is farthest ahead wins
- **Tie Resolution**: Continue racing (same winning order, no card/coin stages) until one is ahead

---

## User Interface Design

### General Display Standards
- **Consistency Requirements**: Uniform color schemes, fonts, and scaling throughout game
- **Player Cards**: Displayed horizontally at top of screen, arranged centered
- **Active Player**: Distinct thicker border and unique background color

### Player Card Components

#### Always Present Elements
1. **Player Name**: Centered horizontally just above middle of card
2. **Pawn Graphic**: Player's color, centered horizontally just below player's name
3. **Lap Number**: Top-right corner (appears after start of 1st racing stage)

#### Stage-Specific Elements

**Dealer Selection:**
- Selected card displayed in dealer button area (only during dealer selection stage)
- Dealer button appears over lowest card (before advancing to Storm stage)
- **Note**: After dealer selection, only dealer button remains on player card

**Storm Stage:**
- Dealer button (top of player card, passed sequentially for all subsequent rounds)
- Winning order badges (top-left corner) - previous badges cleared, new badges appear as players finish
- Cards in hand: SVG of fanned cards representing actual count (up to 8)
- Numerical card count overlay over fanned card graphic

**Lane Selection Stage:**
- Dealer button remains
- Winning order badges remain
- No additional elements

**Coin Stage:**
- Previous elements remain
- **Drawn coins appear**: Face-up to coin owner, concealed (face-down) to other players, positioned below pawn (half extending below card edge)
- Coins arranged side-by-side (no overlap)
- **Selection**: Clicking coin makes it grow slightly with outer glow
- **Placement**: Selected coin disappears from card when placed on track
  - **Track Placement**: Coins are placed on track face down to conceal the coin's value from other players
  - **Owner Visibility**: Player who placed the coin can see that coin's value on the track

**Racing Stage:**
- Dealer button and badges remain
- Rolled die (or dice) appear at bottom of card, remain until stage complete

### Game Area Layouts

#### Storm Stage Layout
- **Top**: Player cards (consistent position, always visible)
- **Middle**: Discard pile and stock pile, side by side, centered horizontally below player cards
- **Stock Pile Label**: "Draw N" (showing number of cards to be drawn and below that "X cards" shows number of remaining cards in the deck)
- **Bottom**: Current player's hand area, centered horizontally below the two piles

#### Track View Layout
*Used for Lane Selection, Coin, and Racing stages*

- **Track Window**: Occupies area below player cards
- **Controls**:
  - Pan with left mouse button and drag
  - Zoom with mouse wheel (zoom to cursor)
- **Lane Selection**: Pan & zoom disabled, view zoomed and centered on position 96
- **Car Movement**: When pawn is to start moving, pan & zoom disabled, view zooms to and follows moving pawn

### Special UI Elements

#### Queen Play Interface
- **Chat Bubble**: Appears on left side of played Queen (on discard pile)
- **Suit Selection**: Four suit symbols (no text) for player to select
- **Visual Suggestion**: Chat bubble suggests Queen is speaking (calling) the suit
- **Result Display**: Once suit selected, Queen's Q and suit in top left corner, called suit symbol (large) in middle

#### Toxic 7 Interface
- **Stock Pile**: Changes to toxic color
- **Draw Text**: Changes to "Draw 2", increments by 2 for each toxic 7 stacked

#### Stage Transitions
- **Results Popup**: Appears after each stage completion
- **Host Control**: "Continue to [Next Stage]" button
- **Other Players**: "Waiting for host" message

---

## Game Lobby and Setup

### Lobby System

#### Room Creation
1. Player clicks "Host"
2. **Room Name**: Text box (required)
3. **Create Room**: Button creates room displayed in lobby with:
   - Room name and host name
   - Number of players
   - Game status (Waiting to start / Started)
   - Game rules settings
   - Join button (inactive if room full - 4 players max)

#### Game Rule Settings
- **Number of laps**: 1-5
- **Number of dice**: 1 or 2
- **Number of decks**: 1 or 2
- **Cards per hand**: 3-5
- **Number of coins**: 1-3

#### Player Management
- **4 player slots maximum** (host always in slot 1)
- **Player Colors**: Auto-assigned randomly from available unused colors on join
  - Available: Yellow, Orange, Red, Pink, Purple, Blue, Green, Black
  - **Change color button**: Pick from available (unassigned) colors
- **Host Controls**: 
  - **Kick button**: Host can kick a player from the room
- **Messaging Implementation**:
  - **Private Message**: Message text box with send button (private message to this player)
  - **Room Chat**: Message text box at bottom with send button (room chat)
  - **Chat Window**: Displays messages with symbol (private or general): Player name: Message

#### Joining Rooms
- Click "Join" on available room
- Assigned to next open slot (2-4)

---

## Track Layout and Position System

### Track Position System
- **Continuous Track**: Numbered sequentially from 1 to 96
- **Track Orientation**: The track has:
  - **Straights**: 4 starights with 10 spaces (positions) per lane per straight (10 x 4 = 40)
  - **Corners**: 4 corners with 14 spaces (positions) per lane per corner (14 x 4 = 56)
  - **Totals**: For a total of 96 (40 + 56) spaces per lane.
  - **Start/Finish Line**: The start / finish line is at middle of the right straight.
- **Position 1**: First space after start/finish line
- **Position 96**: Last space before start/finish line (pole positions)
- **Start/Finish Line**: Located between positions 96 and 1
- **Track Type**: Square racing track with four rounded corners and four lanes
- **Lane Configuration**: Lane 1 is inside lane, Lane 4 is outside lane

### Lane Structure
- **Four Lanes**: Available for racing
- **Pit Lane**: Separate 5-space corridor adjacent to main track lane 1 positions 1 to 5 (pit-lane position 1 next to (left of) lane 1 position 1, ... pit-lane position 5 is left of lane 1 position 5)
- **Pit Area**: Separate holding area connected to pit lane with access to pit-lane position 1

### Track Layout References
- **SVG**: /shared/GameBoardRef.svg
- **DXF**: /shared/GameBoardRef.dxf
- **PNG**: /shared/GameBoardRef.png


## Animation and Timing Specifications

### Dealer Selection Animations
1. **Initial Deal**: 18 cards dealt with animation into three rows of six cards
2. **Card Selection**: Card flip animation when clicked (0.5 seconds)
3. **Card Movement**: After 0.5 seconds, flipped card animates towards player's card, shrinking and finishing above player's name
4. **Dealer Button**: When dealer determined, dealer button animates dropping onto selected card on player's card
5. **Stage Transition**: After 1.0 second delay, game advances to first Storm stage

### Storm Stage Animations
1. **Dealing**: Animated movement of cards into hand area, dealt one at a time at 0.3 seconds per card
2. **Player Cards**: Card count SVG and count update during dealing
3. **Active Player**: Player's cards grow (zoom by 1.4x without overlapping) during their turn
4. **Card Play**: Legal cards animate to discard pile when clicked
5. **Queen Play**: Chat bubble appears for suit selection to the left side of the Queen and doesn't obstruct the hand or deck
6. **Seven Play**: Draw pile changes to toxic color, text updates to "Draw 2" (or 4, 6, 8 increasing by two for each toxic 7)
7. **Finishing**: Badges placed on player cards as players discard last card

### Track View Controls
- **Pan**: Left mouse button and drag
- **Zoom**: Mouse wheel (zoom to cursor position)
- **Lane Selection**: Pan & zoom disabled, view centered on four spots at position 96
- **Movement Animation**: Pan & zoom disabled, view moves and zooms to pawn and stays centered on moving pawn
  - **Pre & Post Move Animation**: Pan & zoom restored when next player is rolling

---

## Technical Notes

### Dice Usage Rules
- **Die**: Singular (one die)
- **Dice**: Plural (multiple dice or when referring to the general concept)
- **Movement Dice Configuration**: Host sets this game rule before game starts (1 or 2 dice for movement)
  - **Standard Movement**: Uses host-configured setting (1 or 2 dice)
    - When game setting call for rolling two dice, the dice are added up and the player moves the total, adhering to movement rules.
  - **Pit Movement**: Always uses exactly 1 die (regardless of game setting)
  - **Lane-Change Movement**: Always uses exactly 1 die (lane-change die only)
- **No Player Choice**: Once game starts, dice usage follows the rules above - players cannot choose different dice configurations mid-game

*Document Status: Work in Progress - Additional sections planned: complete track layout details, sound specifications, networking requirements, and additional animations*
