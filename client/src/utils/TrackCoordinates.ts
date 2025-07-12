/**
 * Track Coordinate System for Havoc Speedway
 * Loads and manages the race track layout from TrackCoordinates.csv
 */

export interface TrackPosition {
  spot: number;
  lane: number;
  x: number;
  y: number;
}

export interface PitPosition {
  position: number;
  x: number;
  y: number;
}

class TrackCoordinateSystem {
  private static instance: TrackCoordinateSystem;
  private positions: Map<string, TrackPosition> = new Map();
  private initialized = false;

  static getInstance(): TrackCoordinateSystem {
    if (!TrackCoordinateSystem.instance) {
      TrackCoordinateSystem.instance = new TrackCoordinateSystem();
    }
    return TrackCoordinateSystem.instance;
  }

  /**
   * Initialize the coordinate system by loading track data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load CSV data (in a real implementation, this would fetch from server)
      // For now, we'll hardcode the essential positions
      this.loadHardcodedPositions();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize track coordinates:', error);
    }
  }

  /**
   * Get position for a specific spot and lane
   */
  getPosition(spot: number, lane: number): TrackPosition | null {
    const key = `${spot}-${lane}`;
    return this.positions.get(key) || null;
  }

  /**
   * Get all positions for a specific spot (all lanes)
   */
  getSpotPositions(spot: number): TrackPosition[] {
    const positions: TrackPosition[] = [];
    for (let lane = 1; lane <= 4; lane++) {
      const position = this.getPosition(spot, lane);
      if (position) {
        positions.push(position);
      }
    }
    return positions;
  }

  /**
   * Get positions for lane selection (spot 96, all lanes)
   */
  getPolePositions(): TrackPosition[] {
    return this.getSpotPositions(96);
  }

  /**
   * Get pit area positions
   */
  getPitPositions(): PitPosition[] {
    return [
      { position: 1, x: 12.0, y: 0.7 },
      { position: 2, x: 12.0, y: 1.9 },
      { position: 3, x: 12.0, y: 3.1 },
      { position: 4, x: 12.0, y: 4.3 }
    ];
  }

  /**
   * Get pit-lane positions
   */
  getPitLanePositions(): PitPosition[] {
    return [
      { position: 1, x: 13.4174, y: 0.5 },
      { position: 2, x: 13.4174, y: 1.5 },
      { position: 3, x: 13.4174, y: 2.5 },
      { position: 4, x: 13.4174, y: 3.5 },
      { position: 5, x: 13.4174, y: 4.5 }
    ];
  }

  /**
   * Calculate distance between two positions
   */
  calculateDistance(pos1: TrackPosition, pos2: TrackPosition): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get track bounds for viewport calculations
   */
  getTrackBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    return {
      minX: -18,
      maxX: 18,
      minY: -18,
      maxY: 18
    };
  }

  /**
   * Load hardcoded essential positions based on the reference document
   */
  private loadHardcodedPositions(): void {
    // Key positions from the specification
    const keyPositions: TrackPosition[] = [
      // Starting positions (spot 96 - pole positions)
      { spot: 96, lane: 1, x: 14.4174, y: -0.5 },
      { spot: 96, lane: 2, x: 15.4174, y: -0.5 },
      { spot: 96, lane: 3, x: 16.4174, y: -0.5 },
      { spot: 96, lane: 4, x: 17.4174, y: -0.5 },

      // First positions after start/finish line
      { spot: 1, lane: 1, x: 14.4174, y: 0.5 },
      { spot: 1, lane: 2, x: 15.4174, y: 0.5 },
      { spot: 1, lane: 3, x: 16.4174, y: 0.5 },
      { spot: 1, lane: 4, x: 17.4174, y: 0.5 },

      // Some right straight positions
      { spot: 2, lane: 1, x: 14.4174, y: 1.5 },
      { spot: 3, lane: 1, x: 14.4174, y: 2.5 },
      { spot: 4, lane: 1, x: 14.4174, y: 3.5 },
      { spot: 5, lane: 1, x: 14.4174, y: 4.5 },

      // First corner start
      { spot: 6, lane: 1, x: 14.4026, y: 5.528 },

      // Top straight sample
      { spot: 20, lane: 1, x: 4.5, y: 14.4174 },
      { spot: 25, lane: 1, x: -0.5, y: 14.4174 },
      { spot: 29, lane: 1, x: -4.5, y: 14.4174 },

      // Left straight sample
      { spot: 44, lane: 1, x: -14.4174, y: 4.5 },
      { spot: 49, lane: 1, x: -14.4174, y: -0.5 },
      { spot: 53, lane: 1, x: -14.4174, y: -4.5 },

      // Bottom straight sample
      { spot: 68, lane: 1, x: -4.5, y: -14.4174 },
      { spot: 73, lane: 1, x: 0.5, y: -14.4174 },
      { spot: 77, lane: 1, x: 4.5, y: -14.4174 },

      // Final straight
      { spot: 92, lane: 1, x: 14.4174, y: -4.5 },
      { spot: 93, lane: 1, x: 14.4174, y: -3.5 },
      { spot: 94, lane: 1, x: 14.4174, y: -2.5 },
      { spot: 95, lane: 1, x: 14.4174, y: -1.5 }
    ];

    // Store positions and generate lane variants
    keyPositions.forEach(pos => {
      // Store the original position
      this.positions.set(`${pos.spot}-${pos.lane}`, pos);

      // Generate positions for other lanes if this is lane 1
      if (pos.lane === 1) {
        for (let lane = 2; lane <= 4; lane++) {
          const laneOffset = lane - 1;
          let adjustedPos: TrackPosition;

          // Determine if this is a straight or corner section
          if (this.isStraightSection(pos.spot)) {
            adjustedPos = this.adjustStraightPosition(pos, laneOffset);
          } else {
            adjustedPos = this.adjustCornerPosition(pos, laneOffset);
          }

          this.positions.set(`${pos.spot}-${lane}`, adjustedPos);
        }
      }
    });
  }

  /**
   * Check if a spot is in a straight section
   */
  private isStraightSection(spot: number): boolean {
    return (
      (spot >= 1 && spot <= 5) ||    // Right straight
      (spot >= 20 && spot <= 29) ||  // Top straight
      (spot >= 44 && spot <= 53) ||  // Left straight
      (spot >= 68 && spot <= 77) ||  // Bottom straight
      (spot >= 92 && spot <= 96)     // Final straight
    );
  }

  /**
   * Adjust position for straight sections
   */
  private adjustStraightPosition(basePos: TrackPosition, laneOffset: number): TrackPosition {
    let adjustedX = basePos.x;
    let adjustedY = basePos.y;

    // Determine which straight section this is
    if (basePos.x > 10) {
      // Right straight - offset in X direction (move away from track center)
      adjustedX = basePos.x + laneOffset;
    } else if (basePos.x < -10) {
      // Left straight - offset in X direction (move toward track center)
      adjustedX = basePos.x - laneOffset;
    } else if (basePos.y > 10) {
      // Top straight - offset in Y direction (move away from track center)
      adjustedY = basePos.y + laneOffset;
    } else if (basePos.y < -10) {
      // Bottom straight - offset in Y direction (move toward track center)
      adjustedY = basePos.y - laneOffset;
    }

    return {
      spot: basePos.spot,
      lane: basePos.lane + laneOffset,
      x: adjustedX,
      y: adjustedY
    };
  }

  /**
   * Adjust position for corner sections (simplified calculation)
   */
  private adjustCornerPosition(basePos: TrackPosition, laneOffset: number): TrackPosition {
    // For corners, we need to maintain the curved path
    // This is a simplified approach - in a full implementation,
    // we'd calculate the proper arc positions
    const angle = Math.atan2(basePos.y, basePos.x);
    const radius = Math.sqrt(basePos.x * basePos.x + basePos.y * basePos.y);
    const adjustedRadius = radius + laneOffset;

    return {
      spot: basePos.spot,
      lane: basePos.lane + laneOffset,
      x: Math.cos(angle) * adjustedRadius,
      y: Math.sin(angle) * adjustedRadius
    };
  }
}

export const trackCoordinates = TrackCoordinateSystem.getInstance();
