import { Player, Card, Suit } from '@havoc-speedway/shared';
import { GameSounds } from '../../utils/SoundManager';
import { useState } from 'react';

// Storm Stage Component
interface StormStageProps {
    gameState: any; // Using any for now to match GameRoom, will be fixed
    currentPlayerId: string;
    onPlayerAction: (action: any) => void;
}

function StormStage({ gameState, currentPlayerId, onPlayerAction }: StormStageProps) {
    const storm = gameState.storm;
    const [selectedQueenCardId, setSelectedQueenCardId] = useState<string | null>(null);

    if (!storm) {
        return (
            <div className="storm-stage">
                <div className="stage-loading">Loading Storm stage...</div>
            </div>
        );
    }

    const handlePlayCard = (card: Card) => {
        if (card.rank === 'Q' && !storm.toxicSevenActive) {
            setSelectedQueenCardId(card.id);
        } else {
            GameSounds.cardSelect();
            onPlayerAction({
                type: 'PLAY_CARD',
                cardId: card.id,
            });
        }
    };

    const handleSelectSuit = (suit: Suit) => {
        if (selectedQueenCardId) {
            GameSounds.cardSelect();
            onPlayerAction({
                type: 'PLAY_CARD',
                cardId: selectedQueenCardId,
                calledSuit: suit,
            });
            setSelectedQueenCardId(null);
        }
    };

    const handleDrawCards = () => {
        GameSounds.cardDeal();
        onPlayerAction({
            type: 'DRAW_CARDS',
        });
    };

    const isCurrentPlayersTurn = storm.currentPlayerId === currentPlayerId;
    const playerHand = storm.playerHands.get(currentPlayerId);
    const topCard = storm.discardPile?.[storm.discardPile.length - 1];
    const currentTurnPlayer = gameState.players.find((p: Player) => p.id === storm.currentPlayerId);

    const isValidPlay = (card: Card): boolean => {
        if (!topCard) return true; // Can play anything on an empty pile
        if (storm.toxicSevenActive) {
            return card.rank === '7';
        }
        if (card.rank === 'Q') return true;
        if (storm.calledSuit) {
            return card.suit === storm.calledSuit || card.rank === topCard.rank;
        }
        return card.suit === topCard.suit || card.rank === topCard.rank;
    };

    return (
        <div className="storm-stage animate-fade-in">
            <div className="storm-top-bar">
                <div className="turn-indicator">
                    {isCurrentPlayersTurn ? (
                        <div className="your-turn animate-glow">
                            <div className="text-xl font-bold">🎯 Your Turn!</div>
                            {storm.toxicSevenActive && (
                                <div className="toxic-warning animate-pulse">
                                    <div className="text-lg font-bold text-danger">☠️ Toxic 7 Active!</div>
                                    <div className="text-sm">Play a 7 or draw {storm.toxicDrawAmount} cards</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-lg">
                            ⏳ Waiting for <strong>{currentTurnPlayer?.name}</strong> to play...
                        </div>
                    )}
                </div>
            </div>

            <div className="storm-board">
                <div className="deck-and-discard">
                    <div className={`stock-pile ${storm.toxicSevenActive ? 'toxic' : ''}`} onClick={isCurrentPlayersTurn ? handleDrawCards : undefined}>
                        <div className="card-back"></div>
                        <div className="deck-info">
                            <span>Draw {storm.toxicSevenActive ? storm.toxicDrawAmount : 1}</span>
                            <span>{storm.stockPile.length} cards left</span>
                        </div>
                    </div>
                    <div className="discard-pile">
                        {topCard ? (
                            <div className="card-face">
                                <div className={`card-rank ${topCard.suit === 'hearts' || topCard.suit === 'diamonds' ? 'red' : 'black'}`}>{topCard.rank}</div>
                                <div className={`card-suit-icon ${topCard.suit}`}></div>
                                {storm.calledSuit && topCard.rank === 'Q' && (
                                    <div className="called-suit-indicator">{storm.calledSuit}</div>
                                )}
                            </div>
                        ) : (
                            <div className="card-placeholder"></div>
                        )}
                    </div>
                </div>
            </div>

            <div className="player-hand-area">
                <div className="player-hand">
                    {playerHand?.cards.map((card: Card) => (
                        <div
                            key={card.id}
                            className={`hand-card ${isCurrentPlayersTurn && isValidPlay(card) ? 'playable' : ''}`}
                            onClick={() => isCurrentPlayersTurn && isValidPlay(card) && handlePlayCard(card)}
                        >
                            <div className="card-face">
                                <div className={`card-rank ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`}>{card.rank}</div>
                                <div className={`card-suit-icon ${card.suit}`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedQueenCardId && (
                <div className="suit-selection-overlay">
                    <div className="suit-selection-modal">
                        <h4>Call a Suit</h4>
                        <div className="suit-options">
                            {(['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]).map(suit => (
                                <button key={suit} className={`suit-button ${suit}`} onClick={() => handleSelectSuit(suit)}>
                                    <div className={`card-suit-icon ${suit}`}></div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StormStage;
