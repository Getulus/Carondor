import React, { useEffect, useState, useRef } from 'react';
import { MapTile, getWorldMap, axialToPixel, exploreTile } from '../services/mapService';
import './WorldMap.css';

interface WorldMapProps {
  gameId: number;
  onTileClick?: (tile: MapTile) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ gameId, onTileClick }) => {
  const [tiles, setTiles] = useState<MapTile[]>([]);
  const [selectedTile, setSelectedTile] = useState<MapTile | null>(null);
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

    // Fill color based on terrain
    ctx.fillStyle = tile.explored ? tile.color : '#333333';
    ctx.fill();

    // Border
    if (selectedTile?.q === tile.q && selectedTile?.r === tile.r) {
      ctx.strokeStyle = '#FFFF00';
      ctx.lineWidth = 3;
    } else if (tile.occupied_by === 'player') {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
    } else if (tile.occupied_by === 'enemy') {
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
      const tileToExplore: MapTile = closestTile;
      setSelectedTile(tileToExplore);
      
      // Auto-explore tile when clicked
      if (!tileToExplore.explored) {
        try {
          await exploreTile(gameId, tileToExplore.q, tileToExplore.r);
          // Refresh the tile
          const updatedTiles = tiles.map(t => 
            t.q === tileToExplore.q && t.r === tileToExplore.r 
              ? { ...t, explored: true }
              : t
          );
          setTiles(updatedTiles);
        } catch (err) {
          console.error('Failed to explore tile:', err);
        }
      }
      
      if (onTileClick) {
        onTileClick(tileToExplore);
      }
    }
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
                <strong>Controlled by:</strong> {selectedTile.occupied_by}
              </p>
            )}
            {!selectedTile.explored && (
              <p className="exploration-status">
                <em>Click to explore this tile</em>
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="map-controls">
        <button onClick={() => setViewOffset({ x: 0, y: 0 })}>
          Reset View
        </button>
        <button onClick={loadMap}>Refresh Map</button>
        <p className="map-info">
          Drag to pan • Click tiles to explore • {tiles.length} tiles total
        </p>
      </div>
    </div>
  );
};

export default WorldMap;
