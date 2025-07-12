import { Card, Suit, Rank } from '@havoc-speedway/shared';

/**
 * Represents a deck of playing cards with shuffle and deal functionality
 * Uses Storm Rules cards (7, 8, 9, 10, J, Q, K, A) = 32 cards total
 */
export class CardDeck {
    private cards: Card[];
    private discardPile: Card[];
    private isDoubleDeck: boolean;

    constructor(doubleDeck: boolean = false) {
        this.cards = [];
        this.discardPile = [];
        this.isDoubleDeck = doubleDeck;
        this.initializeDeck();
        this.shuffle();
    }

    /**
     * Initialize deck with Storm Rules cards (7 through A only)
     * Single deck = 32 cards, Double deck = 64 cards
     */
    private initializeDeck(): void {
        this.cards = [];
        const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        const deckCount = this.isDoubleDeck ? 2 : 1;
        
        for (let deck = 0; deck < deckCount; deck++) {
            for (const suit of suits) {
                for (const rank of ranks) {
                    const id = `${rank}_of_${suit}${this.isDoubleDeck ? `_deck${deck + 1}` : ''}`;
                    this.cards.push({ suit, rank, id });
                }
            }
        }
    }

    /**
     * Shuffle the deck using Fisher-Yates algorithm
     */
    shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    /**
     * Deal a single card from the top of the deck
     * @returns The dealt card or null if deck is empty
     */
    dealCard(): Card | null {
        if (this.cards.length === 0) {
            this.reshuffleFromDiscard();
        }
        
        return this.cards.pop() || null;
    }

    /**
     * Deal multiple cards
     * @param count Number of cards to deal
     * @returns Array of dealt cards
     */
    dealCards(count: number): Card[] {
        const dealtCards: Card[] = [];
        for (let i = 0; i < count; i++) {
            const card = this.dealCard();
            if (card) {
                dealtCards.push(card);
            } else {
                break; // No more cards available
            }
        }
        return dealtCards;
    }

    /**
     * Add a card to the discard pile
     * @param card Card to discard
     */
    discard(card: Card): void {
        this.discardPile.push(card);
    }

    /**
     * Get the number of cards remaining in the deck
     */
    get cardsRemaining(): number {
        return this.cards.length;
    }

    /**
     * Get the number of cards in the discard pile
     */
    get discardedCount(): number {
        return this.discardPile.length;
    }

    /**
     * Reshuffle discarded cards back into the deck when deck is empty
     */
    private reshuffleFromDiscard(): void {
        if (this.discardPile.length === 0) {
            console.warn('No cards available to reshuffle!');
            return;
        }

        // Move discard pile back to deck
        this.cards = [...this.discardPile];
        this.discardPile = [];
        
        // Shuffle the new deck
        this.shuffle();
        
        console.log(`Reshuffled ${this.cards.length} cards from discard pile`);
    }

    /**
     * Get the numeric value of a card for comparison (7 low, Ace high)
     * Used for dealer selection where lowest card wins
     */
    static getCardValue(card: Card): number {
        switch (card.rank) {
            case '7': return 7;
            case '8': return 8;
            case '9': return 9;
            case '10': return 10;
            case 'J': return 11;
            case 'Q': return 12;
            case 'K': return 13;
            case 'A': return 14;
            default: return 0;
        }
    }

    /**
     * Deal cards for dealer selection (18 cards for 3x6 grid)
     */
    dealDealerSelectionCards(): Card[] {
        return this.dealCards(18);
    }

    /**
     * Get the top card of the discard pile
     */
    getTopDiscardCard(): Card | null {
        return this.discardPile.length > 0 ? this.discardPile[this.discardPile.length - 1] : null;
    }

    /**
     * Reset the deck to initial state
     */
    reset(doubleDeck?: boolean): void {
        if (doubleDeck !== undefined) {
            this.isDoubleDeck = doubleDeck;
        }
        this.initializeDeck();
        this.discardPile = [];
        this.shuffle();
    }

    /**
     * Get remaining cards in deck
     */
    getRemainingCards(): Card[] {
        return [...this.cards];
    }

    /**
     * Get bottom card from deck
     */
    getBottomCard(): Card | null {
        return this.cards.length > 0 ? this.cards[0] : null;
    }

    /**
     * Add cards back to deck (for reshuffling)
     */
    addCards(cards: Card[]): void {
        this.cards.push(...cards);
    }

    /**
     * Check if this is a double deck
     */
    get isDouble(): boolean {
        return this.isDoubleDeck;
    }
}
