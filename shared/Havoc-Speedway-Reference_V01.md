# Havoc Speedway

**Game Design Reference Document - Version 1.0**

## Table of Contents
1. [Storm Rules (Card Game)](#storm-rules)
2. [Game Flow Overview](#game-flow-overview)
3. [Detailed Stage Descriptions](#detailed-stage-descriptions)
4. [User Interface Design](#user-interface-design)
5. [Technical Specifications](#technical-specifications)

---

## Storm Rules

*Card game based on Prsi, similar to Crazy 8s*

### Card Deck
- **Ranks Used**: 7, 8, 9, 10, J, Q, K, A (all four suits: hearts, diamonds, spades, clubs)
- **Single Deck**: 32 cards (8 ranks × 4 suits)
- **Game Options**: Single deck (32 cards) or double deck (64 cards)

### Special Card Rules

#### Aces
- **Effect**: Skip the next player's turn

#### Queens
- **Effect**: Wild card that can be played on any card **except** a toxic 7
- **Requirement**: Player must call a suit when playing a Queen (unless the queen finishes the Storm round)

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
   - Deal cards face down to each player
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
- **Rank** of the top discard card.
- **Exception**: If a Queen changes the suit, the played Queen assumes the called suit.

#### Special Situations
- **Toxic 7 Active**: Player can only play another 7 or draw required cards
- **Non-toxic Situations**: Player may play a Queen as wild card and call suit
- **Drawing Rule**: Unlike Crazy 8s, players cannot play immediately after drawing - turn ends

#### Winning and Turn Order
1. **First to empty hand**: Receives "1st" badge
2. **Remaining players**: Continue until all have finishing positions (1st, 2nd, 3rd, 4th)
3. **Two-player endgame**: If a player finishes with a Queen, no suit call needed
4. **Next round**: Dealer button advances clockwise

---

## Game Flow Overview

### Complete Game Sequence
1. **Dealer Selection Stage** *(Once per game)*
2. **Storm Stage** *(repeated each round)*
3. **Lane Selection Stage** *(Once per game, after first Storm)*
4. **Coin Stage** *(Repeated each round)*
5. **Racing Stage** *(Repeated each round)*

---

## Detailed Stage Descriptions

### 1. Dealer Selection Stage
*Occurs once at game start*

#### Process
- **Display**: 18 face-down cards in 3 rows of 6 cards
- **Selection**: Players take turns (by room seat order) selecting one card
- **Dealer Determination**: Player with lowest card becomes dealer
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
- **Track Position**: All players start at position 96 (pole positions)
- **Interface**: Dashed circles indicate selectable positions
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
  - No coins in pit or pit lane areas
  - No coins in 6 spaces directly in front of other players' pawns
- **Process**: Each player places all their coins on their turn

#### Coin Values (90 total coins)
- **+2** (16 coins) - Move forward 2 spaces
- **+3** (12 coins) - Move forward 3 spaces  
- **+4** (8 coins) - Move forward 4 spaces
- **+5** (6 coins) - Move forward 5 spaces
- **-2** (16 coins) - Move backward 2 spaces
- **-3** (12 coins) - Move backward 3 spaces
- **-4** (8 coins) - Move backward 4 spaces
- **-5** (6 coins) - Move backward 5 spaces
- **Tow-to-Pit** (6 coins) - Sent to pit (no lap credit)

### 5. Racing Stage

#### Turn Options
Players choose one of two types of dice each turn:

##### Option 1: Movement Die (Or dice - optional game setting)
- **Movement Rules**:
  - Cars cannot be jumped (they are obstructions)
  - Only one car per space
  - If obstructed, land on last available space before obstruction
- **Landing on Coins**:
  - Coin is revealed and effect applied immediately
  - Coin-induced movement follows same obstruction rules
  - Chain reactions possible (no limit)

##### Option 2: Lane-Change Die (6-sided)
- **Face 1**: L1 - Move one lane left (if not obstructed)
- **Face 2**: R1 - Move one lane right (if not obstructed)  
- **Face 3**: Check Engine - Turn ends
- **Face 4**: L2 - Move up to two lanes left
- **Face 5**: R2 - Move up to two lanes right
- **Face 6**: Check Engine - Turn ends

**Note**: Lane changes to pit lane are possible and allowed

#### Pit System

##### Pit Rules
- **Trigger**: Tow-to-Pit coin or specific game events
- **Next Turn**: Must roll single standard die to advance to pit lane
- **Pit Lane**: 5 spaces total
- **Crash Rule**: Rolling 6 from pit crashes into wall, returns to pit

##### Pit Lane Rules
- **Die Choice**: Standard die OR lane-change die
- **Restriction**: If space to right is obstructed, must use standard die
- **Exit Requirements**: Only R1 or R2 on lane-change die allows track re-entry
- **Re-entry**: Standard obstruction and coin rules apply

#### Race Completion
- **Finish Condition**: Cross finish line on final lap
- **Winner Determination**: Player furthest ahead when round ends
- **Tie Resolution**: Continue racing (same winning order, no card/coin stages)

---

## User Interface Design

### General Display Standards
- **Consistency Requirements**: Uniform color schemes, fonts, and scaling
- **Player Cards**: Displayed horizontally at top, centered
- **Active Player**: Distinct border and background color

### Player Card Components

#### Always Present
1. **Player Name**: Centered above middle of card
2. **Pawn Graphic**: Player's color, below name
3. **Lap Number**: Top right corner (after first Racing stage)

#### Stage-Specific Elements

**Dealer Selection**:
- Selected card displayed in dealer button area (Only during dealer selection stage)
- Dealer button appears over lowest card (before advancing to Storm stage - Then only dealer button remains on player card)

**Storm Stage**:
- Dealer button (top of player card - passed sequentially)
- Winning order badges (top-left corner)
- Hand count with fanned card SVG (up to 8 cards)
- Numerical card count display

**Coin Stage**:
- Face-up coins below pawn (half extending below card edge)
- Side-by-side arrangement (no overlap)
- Selection highlighting (glow effect)
- Coins disappear when placed

**Racing Stage**:
- Dealer button and badges remain
- Rolled dice display at bottom of card

### Game Area Layouts

#### Storm Stage Layout
- **Top**: Player cards (always visible)
- **Middle**: Discard pile and stock pile (side by side, centered)
- **Bottom**: Current player's hand (centered)
- **Animations**: 
  - Card dealing at 0.3 seconds per card
  - Cards animate to discard pile when played
  - Player cards scale 1.4x during their turn

#### Track View Layout
*Used for Lane Selection, Coin, and Racing stages*

- **Controls**: 
  - Pan with left mouse drag
  - Zoom with mouse wheel (to cursor)
- **Lane Selection**: Pan/zoom disabled, focused on position 96
- **Position Reference**: Start/finish line between positions 96 and 1

### Special UI Elements

#### Queen Play Interface
- **Chat Bubble**: Appears left of played Queen
- **Suit Selection**: Four suit symbols (no text)
- **Visual Result**: Called suit appears large in card center

#### Toxic 7 Interface
- **Stock Pile**: Changes to toxic color
- **Draw Text**: Updates to "Draw 2" (increments by 2 for stacked 7s)

#### Stage Transitions
- **Results Popup**: Appears after each stage completion
- **Host Control**: "Continue to [Next Stage]" button
- **Other Players**: "Waiting for host" message

---

## Technical Specifications

### Game Configuration Options
- **Number of Laps**: 1-5
- **Number of Dice**: 1 or 2
- **Number of Decks**: 1 or 2  
- **Cards Per Hand**: 3-5
- **Coins Awarded**: 1-3 (for first place)

### Player Colors
Available options: Yellow, Orange, Red, Pink, Purple, Blue, Green, Black

### Animation Timing
- **Card Dealing**: 0.3 seconds per card
- **Card Selection**: 0.5 seconds before movement
- **Stage Transition**: 1.0 second delay after dealer selectio

I don't like how you summerized the timings. Your summary is vague and confusing. You were tasked with making misinterpretation unlikely.
Look at my original file and make sure you are not dumbing this document down so much that it's clear as mud.

---

## Known Issues and Contradictions

⚠️ **Issues Requiring Resolution:**

1. **Dice Terminology**: Document uses both "dice" and "die" inconsistently
  - What?
    - Die is singular. Dice is plural.
2. **Lane Change Logic**: Unclear what "left" and "right" mean on a circular track
  - What?
    - My origal file makes this clear. Left towards inside. Right towards outside.
3. **Pit Rules Clarity**: Multiple references to pit rules with varying details
  - Explain your confusion. The pit and pit-lane are not the same thing.
4. **Track Positions**: Position numbering system (96, 1) needs clarification
  - What?
    - It's a continous track. the first space over the starting line is space 1.
    - The last spot before the finish line is spot 96.
    - What is unclear?
5. **Chain Reactions**: Unlimited coin chain reactions could cause infinite loops
  - What?
    - Coins are removed from the track when triggered.
6. **Two-Deck Implications**: No discussion of how two decks affect gameplay balance
  - What?
    - More uncertainty with more 7s, queens, and aces. Potential for longer rounds.

⚠️ **Incomplete Sections:**
- Complete lobby system specifications
- Detailed track layout and position system
- Complete racing stage victory conditions
- Full animation and sound specifications
- Network/multiplayer technical requirements

---

*Document Status: Work in Progress - Requires completion of incomplete sections and resolution of identified contradictions*
