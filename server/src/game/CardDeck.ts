import { Card, Suit, Rank } from '@havoc-speedway/shared';

/**
 * Represents a deck of playing cards with shuffle and deal functionality
 * Uses Storm Rules cards (7, 8, 9, 10, J, Q, K, A) = 32 cards total
 */
export class CardDeck {
    private cards: Card[];
    private discardPile: Card[];

    constructor() {
        this.cards = [];
        this.discardPile = [];
        this.initializeDeck();
        this.shuffle();
    }

    /**
     * Initialize a standard 52-card deck
     * Note: Using Storm Rules cards (7 through A only)
     */
    private initializeDeck(): void {
        this.cards = [];
        const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        for (const suit of suits) {
            for (const rank of ranks) {
                const id = `${rank}_of_${suit}`;
                this.cards.push({ suit, rank, id });
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
     * Get the numeric value of a card for comparison
     * Used for dealer selection (highest card wins)
     * Storm Rules uses cards 7-A only
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
     * Reset the deck to initial state with all 32 cards (Storm Rules)
     */
    reset(): void {
        this.initializeDeck();
        this.discardPile = [];
        this.shuffle();
    }
}
