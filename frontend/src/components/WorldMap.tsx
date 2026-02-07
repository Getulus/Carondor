import React, { useEffect, useState, useRef } from 'react';
import { MapTile, getWorldMap, axialToPixel } from '../services/mapService';
import AttackModal from './AttackModal';
import './WorldMap.css';

interface WorldMapProps {
  gameId: number;
  onTileClick?: (tile: MapTile) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ gameId, onTileClick }) => {
  const [tiles, setTiles] = useState<MapTile[]>([]);
  const [selectedTile, setSelectedTile] = useState<MapTile | null>(null);
  const [showAttackModal, setShowAttackModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const HEX_SIZE = 30;

  useEffect(() => {
    loadMap();
  }, [gameId]);

  useEffect(() => {
    if (tiles.length > 0) {
      drawMap();
    }
  }, [tiles, viewOffset, selectedTile]);

  const loadMap = async () => {
    try {
      setLoading(true);
      const data = await getWorldMap(gameId);
      setTiles(data.tiles);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load map');
    } finally {
      setLoading(false);
    }
  };

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Center the view
    const centerX = canvas.width / 2 + viewOffset.x;
    const centerY = canvas.height / 2 + viewOffset.y;

    // Draw all tiles
    tiles.forEach((tile) => {
      const { x, y } = axialToPixel(tile.q, tile.r, HEX_SIZE);
      const screenX = centerX + x;
      const screenY = centerY + y;

      // Check if tile is visible on screen
      if (
        screenX < -HEX_SIZE * 2 ||
        screenX > canvas.width + HEX_SIZE * 2 ||
        screenY < -HEX_SIZE * 2 ||
        screenY > canvas.height + HEX_SIZE * 2
      ) {
        return; // Skip rendering off-screen tiles
      }

      drawHexagon(ctx, screenX, screenY, HEX_SIZE, tile);
    });
  };

  const drawHexagon = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    tile: MapTile
  ) => {
    const angle = (Math.PI / 180) * 60;
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const xPos = x + size * Math.cos(angle * i);
      const yPos = y + size * Math.sin(angle * i);
      if (i === 0) {
        ctx.moveTo(xPos, yPos);
      } else {
        ctx.lineTo(xPos, yPos);
      }
    }
    ctx.closePath();

    // Fill color based on ownership and terrain
    if (tile.occupied_by === 'player') {
      // Player-owned tiles have a green tint
      ctx.fillStyle = tile.color;
      ctx.fill();
      ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
      ctx.fill();
    } else if (tile.occupied_by === 'neutral' && tile.enemy) {
      // Neutral tiles with enemies have a red tint
      ctx.fillStyle = tile.color;
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fill();
    } else {
      ctx.fillStyle = tile.explored ? tile.color : '#333333';
      ctx.fill();
    }

    // Border
    if (selectedTile?.q === tile.q && selectedTile?.r === tile.r) {
      ctx.strokeStyle = '#FFFF00';
      ctx.lineWidth = 3;
    } else if (tile.occupied_by === 'player') {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
    } else if (tile.occupied_by === 'neutral') {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
    }
    ctx.stroke();

    // Draw resource icons for explored tiles
    if (tile.explored && Object.keys(tile.resource_bonuses).length > 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('+', x, y + 4);
    }

    // Draw enemy indicator on neutral tiles
    if (tile.occupied_by === 'neutral' && tile.enemy) {
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚔', x, y + 4);
    }

    // Draw player town indicator at center
    if (tile.q === 0 && tile.r === 0 && tile.occupied_by === 'player') {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏰', x, y + 5);
    }
  };

  const handleCanvasClick = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Find clicked tile
    const centerX = canvas.width / 2 + viewOffset.x;
    const centerY = canvas.height / 2 + viewOffset.y;

    let closestTile: MapTile | null = null;
    let closestDistance = Infinity;

    tiles.forEach((tile) => {
      const { x, y } = axialToPixel(tile.q, tile.r, HEX_SIZE);
      const screenX = centerX + x;
      const screenY = centerY + y;

      const distance = Math.sqrt(
        Math.pow(clickX - screenX, 2) + Math.pow(clickY - screenY, 2)
      );

      if (distance < HEX_SIZE && distance < closestDistance) {
        closestTile = tile;
        closestDistance = distance;
      }
    });

    if (closestTile !== null) {
      const tileToSelect: MapTile = closestTile;
      setSelectedTile(tileToSelect);
      
      // Don't auto-open modal, let user click the button in the info panel
      
      if (onTileClick) {
        onTileClick(tileToSelect);
      }
    }
  };

  const isAdjacentToPlayer = (tile: MapTile): boolean => {
    const directions = [
      [1, 0], [1, -1], [0, -1],
      [-1, 0], [-1, 1], [0, 1]
    ];

    for (const [dq, dr] of directions) {
      const neighbor = tiles.find(t => t.q === tile.q + dq && t.r === tile.r + dr);
      if (neighbor && neighbor.occupied_by === 'player') {
        return true;
      }
    }

    return false;
  };

  const handleAttackSuccess = () => {
    // Reload the map after successful attack
    loadMap();
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX - viewOffset.x, y: event.clientY - viewOffset.y });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setViewOffset({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    // Could add zoom functionality here
  };

  if (loading) {
    return <div className="world-map-loading">Loading world map...</div>;
  }

  if (error) {
    return <div className="world-map-error">Error: {error}</div>;
  }

  return (
    <div className="world-map-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="world-map-canvas"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {selectedTile && (
        <div className="tile-info-panel">
          <h3>{selectedTile.terrain_name}</h3>
          <p className="tile-description">{selectedTile.description}</p>
          <div className="tile-stats">
            <p>
              <strong>Coordinates:</strong> ({selectedTile.q}, {selectedTile.r})
            </p>
            <p>
              <strong>Defense Bonus:</strong> +{selectedTile.defense_bonus}
            </p>
            <p>
              <strong>Movement Cost:</strong> {selectedTile.movement_cost}
            </p>
            {Object.keys(selectedTile.resource_bonuses).length > 0 && (
              <div className="resource-bonuses">
                <strong>Resource Bonuses:</strong>
                <ul>
                  {Object.entries(selectedTile.resource_bonuses).map(([resource, bonus]) => (
                    <li key={resource}>
                      {resource.replace('_', ' ')}: +{bonus}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedTile.occupied_by && (
              <p className="occupation-status">
                <strong>Status:</strong> {
                  selectedTile.occupied_by === 'player' ? '✓ Your Territory' :
                  selectedTile.occupied_by === 'neutral' ? '⚔ Neutral (Enemy)' :
                  selectedTile.occupied_by
                }
              </p>
            )}
            {selectedTile.enemy && (
              <div className="enemy-preview">
                <p><strong>Enemy:</strong> {selectedTile.enemy.name}</p>
                <p><strong>Power:</strong> {selectedTile.enemy.power}</p>
              </div>
            )}
            {selectedTile.occupied_by === 'player' && (
              <button 
                className="view-tile-button"
                onClick={() => setShowAttackModal(true)}
              >
                🏰 View Territory
              </button>
            )}
            {selectedTile.occupied_by === 'neutral' && (
              <>
                {isAdjacentToPlayer(selectedTile) ? (
                  <button 
                    className="attack-tile-button"
                    onClick={() => setShowAttackModal(true)}
                  >
                    ⚔️ Attack This Tile
                  </button>
                ) : (
                  <p className="warning-text">
                    <em>Must be adjacent to your territory to attack</em>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="map-controls">
        <div>
          <button onClick={() => setViewOffset({ x: 0, y: 0 })}>
            Reset View
          </button>
          <button onClick={loadMap}>Refresh Map</button>
        </div>
        <p className="map-info">
          Drag to pan • Click tiles to view • {tiles.length} tiles total
        </p>
        <div className="map-legend">
          <span className="legend-item"><span className="legend-color player"></span> Your Territory</span>
          <span className="legend-item"><span className="legend-color enemy"></span> Enemy Territory</span>
          <span className="legend-item">⚔ = Enemy</span>
          <span className="legend-item">🏰 = Town</span>
        </div>
      </div>

      {showAttackModal && (
        <AttackModal
          tile={selectedTile}
          gameId={gameId}
          onClose={() => setShowAttackModal(false)}
          onAttackSuccess={handleAttackSuccess}
        />
      )}
    </div>
  );
};

export default WorldMap;
