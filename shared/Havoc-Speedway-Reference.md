Havoc Speedway

Storm rules: (based on Prsi, similar to Crazy 8s)
  Only 7,8,9,10,J,Q,K,A (hearts, diamonds, spades, clubs) are used.
    A single deck contains 32 cards (8 ranks of 4 suits)
    Games can be played with a sing deck (32 cards) or two decks (64 cards)
  Special ranks:
    Aces - skips the next player
    Queens - wild card. Can be played on any card except a toxic 7.
    Sevens - Toxic. When played, the next player must play a 7 or draw 2.
      Each stacked 7 on top of a toxic 7 adds 2 to the required draw.
      Once a player draws on a toxic 7 (or stacked toxic 7s)m the seven is no longer toxic.
      Any 7 played on this non-toxic 7 will only be considered a single toxic 7. (draw 2)
  The dealer deals the cards one at a time, face down, in sequential order starting with the player (clockwise) after the dealer.
    The number of cards dealt to each player is set by the host before the game (3 to 5)
    After dealing the required cards to each player, the dealer turns over one card to start the discard deck and places the remaining cards as the stock pile.
      If a Queen is dealt as the first card, she calls the suit of the card at the bottom of the deck.
      If a 7 is dealt as the first card, it is considered Toxic. (play a 7 or pick up 2)
      The player after the dealer (sequential order, clockwise) is first to act (unless skipped by an Ace)
      He must only play a card that matches the suit or the rank unless:
        the card is a toxic 7, in which case he can play a seven or pickup (2 or 4 or 8 or ...)
        the card is not a toxic 7, he may play a Queen and change the suit.        
      Unlike Crazy 8s, a player cannot play a card as soon as he draws it. When a player draws, their turn is over.
      First player to discard their last card, wins.
        Remaining players continue playing for finishing order. (winning order)
        Once there are only two players remaining:
          If a player finished with a Queen, there is no need to call a suit since the game is over.
      As each player discards their last card, they take their winning order badge (1st, 2nd, 3rd, 4th)
  In the next Storm stage, the dealer button advances to the next player in sequential (clockwide) direction.
    Discarding first is an advantage (dealing is a disadvantage), especially with small inital hands, so players must take turns dealing.


Basic gameplay logic:
  Dealer Selection stage: (determine who will deal the first round. This happens only once)
    Players will see 18 face down cards arranged in three rows of 6 cards across. (from a rondomly shuffled deck)
    Players will take turns (in room seat order) selecting a card.
      Lowest card loses and is declared the starting dealer. In the event of a tie, the tied players pick again until the tie is broken.
    Selected dealer takes the dealer button and will deal the first hand.
  Storm stage: (Card game - based on Prsi, aka Storm - similar to crazy 8s)
    First player to discard all, receives "1st" badge.
    Other continue playing until only one player holding cards.
    remaining play determines "2nd", "3rd", and "4th" badges.
    Winning order is used for the other stages in a round.
  Lane Selection Stage: (only happens once and only after the first Storm stage)
    Players take turns in winning order picking lanes.
  Coin Stage: (Players act in winning order)
    Players are awarded coins (drawn at random) based on Storm winning order. Awarded Coins (N) is set by host before game launch.
      1st is awarded N coins.
      2nd is awarded N-1 coins (no negative coins)
      3rd is awarded N-2 coins (no negative coins)
      4th is awarded 0 coins 
    Players take turns (in winning order) placing all of their awarded coins on the track. Each player places all of their coins on their turn.
    Coins cannot be placed on any space in the pit or pit-lane
    Coins cannot be placed in any of the six spaces in front of another player's pawn. (greyed out during coin placement)
  Racing Stage: (Players act in winning order)
    Player chooses to roll one of two dies (or dice for movement if playing with two - pit rules vary)
      1. Roll to move: (movement rules: Cars cannot be jumped, they are obstructions. Only one car can occupy any space.)
        Player's pawn moves forward the rolled amount, unless obstructed by another pawn, in which case they land on the last available space.
        Landing on a coin:
          Coin is revealed and the pawn acts on the coins value:
            Coin induced movement honors the movement rules.
            If coin induced novement lands the pawn on another pawn, the coin is revealed and the pawn acts on the coins value. There is no chain-reaction limit.
          Coin values: (90 total coins)
            +2 (16) - move forward 2
            +3 (12) - move forward 3
            +4 (8) - move forward 4
            +5 (6) - move forward 5
            -5 (6) - move backward 5
            -4 (8) - move backward 4
            -3 (12) - move backward 3
            -2 (16) - move backward 2
            Tow-to-Pit (6) - sent to the pit (no lap is recorded)
      2. Roll lane-change die (6 sided die) (left means towards inside lane, right means towards outside lane)
        face 1: L1 - move one space to the left if not obstructed by wall or pawn.
        face 2: R1 - move one space to the right if not obstructed by wall or pawn.
        face 3: Check Engine symbol - Turn is over.
        face 4: L2 - move two spaces to the left if not obstructed by wall or pawn. Move as far as possible (up to two spaces)
        face 5: R2 - move two spaces to the right if not obstructed by wall or pawn. Move as far as possible (up to two spaces)
        face 6: Check Engine symbol - Turn is over.
          Lane changes on to pit-lane are permitted. Landing on pit-lane results in pit-lane rules on the player's next turn.
    Once a player crosses the finish line on the final lap, all others will finish their racing stage.
      If only one player finishes the race at the end of the round, they are declared the winner and the game is over.
      In the event that more cars cross the finish line (on their final lap), the player that is farther ahead wins.
      In the event of a tie, the tied players continue racing in the same winning order until one player is ahead at the end of the stage. (no card or coin stages) 

    Pit Rules:
      When a player is sent to the pit:
        On their next turn they must roll one (even if playing with two) standard die to advance on to pit-lane.
        There are only 5 spaces in pit lane. Rolling a 6 when in the pit is bad.
        If a player hits the wall at the end of the pit-lane, they are sent back to the pit. (rolling a 6 from pit crashes and sends player back to pit)
          Pit-lane Rules:
            Once on pit-lane, in any pit-lane space:
              A player can choose to roll a standard die or change-lanes die.
                If the spot directly to the right of the player is obstructed by a pawn, he must roll the standard die. (and risk colliding with the pit-lane wall)
                If the player rolls the lane-change die:
                  Only a R1 or R2 will allow him to merge on to the track.
                    If they successfully roll an R?, standard obstruction and coin rules apply.
                  Any other value ends their turn.
              


Game design and flow:

Game site loads:
Players join game lobby.
Lobby shows existing rooms
Player can create a new room (1), or join an existing room (2)
  1. Player click "Host"
    Room name textbox (required)
    Create Room button
      Room is created
        displayed in lobby with information:
          Room name
          Host name
          Number of players
          Game status:
            Waiting to start
            Started
          Game rules:
            Number of laps (1 to 5)
            number of dice (1 or 2)
            number of decks (1 or 2)
            number of cards per hand (3 to 5)
            number of coins (1 to 3)
          Join button (if room is full - 4 player - Join is inactive and greyed out)
        Game rule settings button:
          Number of laps
          number of dice
          number of decks
          number of cards per hand
          number of coins
        Player slots: (4 slots - host is always in slot 1)
          Name
            Kick button (host can kick player from the room)
          Player color (auto assigned by random from available - unused colors)
            Change button (Pick from available - unused colors)
              Yellow
              Orange
              Red
              Pink
              Purple
              Blue
              Green
              Black
          Message textbox
            send button (private message to this player)
        Message textbox
          Send button (room chat)
        Chat window:
          Symbol (private or general): Player name: Message
        Start Game button - Advance to: General Display Settings
  2. Player clicks existing room's active "join" button
    Player joins the room in the next open slot (2 to 4)

General Display Settings:
  To ensure consistency throughout the game experience, the game visuals must adhere to a consistant standard. Color schemes, fonts, scale must be consistent.
    1. Player appear as cards horizontally at the top of the screen, arranges centered.
      1. Player cards have a simple style. Rectangle with rounded corners with a complimentary, subtle border. The card contains:
        1. Player's name (always present)
          Centered horizontally just above the middle of the card.
        2. graphic view of player's Pawn in the player's color (always present)
          Centered horizontally just below the player's name.
        3. Lap Number appears on top of the player card on the top right. (always present after the start of the 1st racing stage.)
        4. Special areas for informative simbols during each stage of the game
          1. Dealer Selection:
            As players select a card from the 18 face down cards, their selected card is displayed in the same area as the dealer button.
            Once a dealer (loser - aka lowest card) is selected, the dealer button appeard over the card. The chosen card will not be present after dealer selection.
          2. Dealer Button (dealer button is passed sequentially for all other rounds)
            Placed above the player card, above players name (not obscuring name) with about 1/4 of the button on the card.
          3. Card game stage
            Dealer button remains
            Winning order badges from previous rounds are cleared and new nadges appear as player discard their last card.
              On top of the top-left corner of the card with some of the badge off of the card.
            Cards in hand represented by a SVG of fanned out cards representing the actual count (up to 8)
              A number on top represents the actual number of cards the player is holding.
          4. Lane Selection Stage: (one time only after first Storm stage)
            Dealer button remains
            Winning order badges remain
          5. Coin Stage:
            Dealer button remains
            Winning order badges remain
            Drawn coins appear face-up on top of the bottom of the card, just below the pawn, about half of the coins below the bottom edge.
            The coins are side-by-side and do not overlap.
              As the player clicks on a coin, to slect it for placement, it will grow slightly and have an outer glow, to highlight it's selection.
              When the selected coin is placed on the track, (available spot is clicked), it will appear on the track and disappear from the player card.
          6. Racing Stage:
            Dealer button remains
            Winning order badges remain
            Rolled Die (or dice) appear on top of the bottom of the card and remain there until the stage is complete.
      2. Active player's card will have a distinct thicker border and unique background color to ensure that it is obvious who's turn it is.

Dealer Selection:
  The 18 cards are dealt (animated with dealing motion) into three rows of six cards.
  Each player, in turn, will flip over a card by clicking on it. The card will flip over in an animated flipping motion.
  after 0.5 seconds, the flipped card animates towards the player's player card, shrinking in size and finishing up on top of the player card just above the player's name.
  When a dealer (loser with the lowest card) is determined. A dealer button will animate being dropped on to the selected card on top of the player's player card.
  After a small delay of 1.0 seconds, the game will advance to the first Storm stage.
  
  
Storm Stage:
  The top of the screen will have the consistent player cards (always on top)
    the discard pile and stock pile, side by side and centered horizontally will be below the player cards.
      The stock pile will have the text "Draw N" for the number of cards to be drawn.
    The player's hand area will be centered horizontally below the two piles (discard and stock)
  Dealing will be have animated movement of the cards into the hand area as they are dealt one at a time.
  Player cards will have their card count SVG and card count update as well.
  Cards will be dealt at a speed of 0.3 seconds per card.
  
  When it is a player's turn to act:
    They player card will indicate with the consistent style as described earlier.
    Their cards will grow (zoom by 1.4x without overlapping) to provide an additional signal to the player.
      when a card (legal card) is clicked (played) it will animate to the discard pile.
        If it is a Queen:
          Create a chat bubble on the left side of the played Queen (on the discard pile) with the four suit symbols (no text) for the player to select.
          The chat buble should suggest the Queen is speaking (calling) the suit.
            Once a suit is selected:
              The Queen's Q and suit will be in the top left corner of the card (like a standard card)
              The called suit sysmbol (large) will be in the middle of the card.
        If it is a 7:
          The draw pile back will display a toxic color.
          The text will change to "Draw 2", and increment by 2 for each toxic 7 stacked.
  Once a player discards their last card, their badge (1st, 2nd ...) is placed on their player card.
  When the Storm game is complete, all player's will have their badges.

A popup will appear with the results of the stage.
  The host will have a button that says "Continue to N stage" while the other players will see "waiting for host".
    Once the host clicks continue, the next stage can begin.

Track view:
  Used for:
    Lane slection stage
    Coin stage
    Racing stage
  The track window will occupy the area below the player cards.
    Pan with left mouse button and drag
    Zoom with mousewheel. (zoom to cursor)
    
Lane Selection Stage: (Only once - after the first Storm stage)
  Pan & Zoom will be disabled.
  View will be zoomed, and centered on four spots at position 96. The four pole position spots (position 96) will have dashed outline circles to signal the only selectable spots.
  The four spots at position 96 are just before the start/finish line which is between the four (position 96) spots and the four (position 1) spots.
    Players will take turns selecting a lane (in winning order) and their pawns will appear on their selected spot.
    When all players have selected a lane, the game will advance to the Coin stage.

Coin Stage:
  