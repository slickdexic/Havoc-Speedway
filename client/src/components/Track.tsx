/**
 * Track Component - Renders the racing track for Havoc Speedway
 * Supports lane selection, coin placement, and racing stages
 */

import { useEffect, useRef, useState } from 'react';
import { trackCoordinates } from '../utils/TrackCoordinates';

interface TrackProps {
  stage: 'lane-selection' | 'coin' | 'racing';
  gameState: any;
  currentPlayerId: string;
  onPlayerAction: (action: any) => void;
}

interface ViewState {
  scale: number;
  translateX: number;
  translateY: number;
}

export function Track({
  stage,
  gameState,
  currentPlayerId,
  onPlayerAction,
}: TrackProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,
    translateX: 0,
    translateY: 0
  });

  // Extract players and coins from gameState
  const players = gameState?.players || [];
  const coins = gameState?.coins || [];
  useEffect(() => {
    trackCoordinates.initialize().then(() => {
      setIsInitialized(true);
    });
  }, []);

  // Set initial view based on stage
  useEffect(() => {
    if (!isInitialized) return;

    if (stage === 'lane-selection') {
      // Focus on pole positions (spot 96)
      const polePositions = trackCoordinates.getPolePositions();
      if (polePositions.length > 0) {
        const centerX = (polePositions[0].x + polePositions[3].x) / 2;
        const centerY = polePositions[0].y;
        setViewState({
          scale: 2.5,
          translateX: -centerX * 10, // Convert to screen coordinates
          translateY: -centerY * 10
        });
      }
    } else {
      // Default view for other stages
      setViewState({
        scale: 0.8,
        translateX: 0,
        translateY: 0
      });
    }
  }, [stage, isInitialized]);

  const handleLaneSelection = (lane: number) => {
    if (stage === 'lane-selection') {
      onPlayerAction({
        type: 'SELECT_LANE',
        playerId: currentPlayerId,
        lane
      });
    }
  };

  // Available for future coin placement interactions
  // const handleCoinPlacement = (spot: number, lane: number) => {
  //   if (stage === 'coin') {
  //     onPlayerAction({
  //       type: 'PLACE_COIN',
  //       playerId: currentPlayerId,
  //       position: { spot, lane }
  //     });
  //   }
  // };

  if (!isInitialized) {
    return (
      <div className="track-loading">
        <div className="loading-spinner">🏁</div>
        <div>Loading track...</div>
      </div>
    );
  }

  const trackBounds = trackCoordinates.getTrackBounds();
  const viewBoxWidth = (trackBounds.maxX - trackBounds.minX) * 10;
  const viewBoxHeight = (trackBounds.maxY - trackBounds.minY) * 10;

  return (
    <div className="track-container">
      <div className="track-stage-header">
        <div className="stage-title">
          {stage === 'lane-selection' && '🛣️ Lane Selection'}
          {stage === 'coin' && '🪙 Coin Placement'}
          {stage === 'racing' && '🏁 Racing'}
        </div>
        {stage === 'lane-selection' && (
          <div className="stage-subtitle">Choose your starting lane</div>
        )}
        {stage === 'coin' && (
          <div className="stage-subtitle">Place your coins strategically</div>
        )}
      </div>

      <div className="track-viewport">
        <svg
          ref={svgRef}
          className="track-svg"
          viewBox={`${trackBounds.minX * 10} ${trackBounds.minY * 10} ${viewBoxWidth} ${viewBoxHeight}`}
          style={{
            transform: `scale(${viewState.scale}) translate(${viewState.translateX}px, ${viewState.translateY}px)`
          }}
        >
          {/* Track surface */}
          <TrackSurface />
          
          {/* Lane dividers */}
          <LaneDividers />
          
          {/* Start/Finish line */}
          <StartFinishLine />
          
          {/* Position markers for lane selection */}
          {stage === 'lane-selection' && (
            <LaneSelectionMarkers onLaneSelect={handleLaneSelection} />
          )}
          
          {/* Coins */}
          {coins.map((coin: any) => (
            <CoinMarker
              key={coin.id}
              coin={coin}
              currentPlayerId={currentPlayerId}
            />
          ))}
          
          {/* Player pawns */}
          {players.map((player: any) => (
            <PlayerPawn
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === currentPlayerId}
            />
          ))}
          
          {/* Pit area */}
          <PitArea />
        </svg>
      </div>

      {stage === 'lane-selection' && (
        <div className="lane-selection-info">
          <div className="info-text">
            Select your starting lane by clicking on the available positions.
            Lane 1 (inside) has shorter corners but more traffic.
            Lane 4 (outside) has longer straights but wider turns.
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components for track elements

function TrackSurface() {
  return (
    <g className="track-surface">
      {/* Outer track boundary */}
      <rect
        x={-180}
        y={-180}
        width={360}
        height={360}
        fill="#2d4a2b"
        stroke="#1a2f1a"
        strokeWidth={2}
        rx={40}
      />
      
      {/* Inner track area */}
      <rect
        x={-160}
        y={-160}
        width={320}
        height={320}
        fill="#4a6b47"
        rx={30}
      />
    </g>
  );
}

function LaneDividers() {
  return (
    <g className="lane-dividers" stroke="#ffffff" strokeWidth={1} strokeDasharray="5,5" opacity={0.6}>
      {/* Lane dividing lines would be calculated based on track geometry */}
      {/* This is simplified for demonstration */}
    </g>
  );
}

function StartFinishLine() {
  return (
    <g className="start-finish-line">
      <line
        x1={144}
        y1={-20}
        x2={174}
        y2={-20}
        stroke="#ffffff"
        strokeWidth={4}
      />
      <line
        x1={144}
        y1={20}
        x2={174}
        y2={20}
        stroke="#ffffff"
        strokeWidth={4}
      />
      <rect
        x={144}
        y={-5}
        width={30}
        height={10}
        fill="url(#checkeredPattern)"
      />
    </g>
  );
}

function LaneSelectionMarkers({ onLaneSelect }: { onLaneSelect: (lane: number) => void }) {
  const polePositions = trackCoordinates.getPolePositions();
  
  return (
    <g className="lane-selection-markers">
      {polePositions.map(pos => (
        <circle
          key={`lane-${pos.lane}`}
          cx={pos.x * 10}
          cy={pos.y * 10}
          r={15}
          fill="rgba(255, 215, 0, 0.3)"
          stroke="#ffd700"
          strokeWidth={3}
          strokeDasharray="5,5"
          className="lane-marker clickable"
          onClick={() => onLaneSelect(pos.lane)}
          style={{ cursor: 'pointer' }}
        >
          <title>Select Lane {pos.lane}</title>
        </circle>
      ))}
    </g>
  );
}

function CoinMarker({ coin, currentPlayerId }: { 
  coin: any; 
  currentPlayerId: string; 
}) {
  const position = trackCoordinates.getPosition(coin.position.spot, coin.position.lane);
  if (!position) return null;

  const isOwner = coin.ownerId === currentPlayerId;
  const showValue = coin.revealed || isOwner;

  return (
    <g className="coin-marker" transform={`translate(${position.x * 10}, ${position.y * 10})`}>
      <circle
        r={8}
        fill={showValue ? getCoinColor(coin.value) : "#8B4513"}
        stroke="#DAA520"
        strokeWidth={2}
      />
      {showValue && (
        <text
          textAnchor="middle"
          dy="0.3em"
          fontSize="8"
          fill="white"
          fontWeight="bold"
        >
          {coin.value > 0 ? `+${coin.value}` : coin.value}
        </text>
      )}
    </g>
  );
}

function PlayerPawn({ player, isCurrentPlayer }: { 
  player: any; 
  isCurrentPlayer: boolean; 
}) {
  if (!player.position) return null;

  const position = trackCoordinates.getPosition(player.position.spot, player.position.lane);
  if (!position) return null;

  return (
    <g 
      className={`player-pawn ${isCurrentPlayer ? 'current-player' : ''}`}
      transform={`translate(${position.x * 10}, ${position.y * 10})`}
    >
      <circle
        r={12}
        fill={getPlayerColor(player.color)}
        stroke="#ffffff"
        strokeWidth={isCurrentPlayer ? 3 : 2}
      />
      <text
        textAnchor="middle"
        dy="0.3em"
        fontSize="8"
        fill="white"
        fontWeight="bold"
      >
        {player.name.charAt(0)}
      </text>
    </g>
  );
}

function PitArea() {
  const pitPositions = trackCoordinates.getPitPositions();
  const pitLanePositions = trackCoordinates.getPitLanePositions();

  return (
    <g className="pit-area">
      {/* Pit area */}
      <rect
        x={110}
        y={0}
        width={20}
        height={50}
        fill="#808080"
        stroke="#606060"
        strokeWidth={2}
        rx={5}
      />
      
      {/* Pit positions */}
      {pitPositions.map(pos => (
        <circle
          key={`pit-${pos.position}`}
          cx={pos.x * 10}
          cy={pos.y * 10}
          r={6}
          fill="#404040"
          stroke="#606060"
        />
      ))}
      
      {/* Pit-lane */}
      <rect
        x={130}
        y={0}
        width={10}
        height={50}
        fill="#A0A0A0"
        stroke="#808080"
        strokeWidth={1}
      />
      
      {/* Pit-lane positions */}
      {pitLanePositions.map(pos => (
        <circle
          key={`pit-lane-${pos.position}`}
          cx={pos.x * 10}
          cy={pos.y * 10}
          r={4}
          fill="#606060"
          stroke="#808080"
        />
      ))}
    </g>
  );
}

// Helper functions

function getCoinColor(value: number): string {
  if (value > 0) {
    return value >= 4 ? '#00ff00' : '#90ee90'; // Green for positive
  } else if (value < 0) {
    return value <= -4 ? '#ff0000' : '#ff6b6b'; // Red for negative
  }
  return '#ffd700'; // Gold for special coins
}

function getPlayerColor(color: string): string {
  const colorMap: Record<string, string> = {
    yellow: '#FFD700',
    orange: '#FF8C00',
    red: '#FF4500',
    pink: '#FF69B4',
    purple: '#9370DB',
    blue: '#4169E1',
    green: '#32CD32',
    black: '#2F2F2F'
  };
  return colorMap[color] || '#808080';
}

export default Track;
