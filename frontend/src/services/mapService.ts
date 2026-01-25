/**
 * World map service for API interactions
 */

import { API_URL } from '../config';

// API_URL already includes /api, so we use it directly
const API_BASE_URL = API_URL;

export interface ResourceBonuses {
  food?: number;
  wood?: number;
  gold?: number;
  stone?: number;
  iron?: number;
  crystal?: number;
  soul_energy?: number;
}

export interface MapTile {
  id: number;
  q: number;
  r: number;
  terrain_type: string;
  terrain_name: string;
  color: string;
  defense_bonus: number;
  movement_cost: number;
  resource_bonuses: ResourceBonuses;
  description: string;
  occupied_by: string | null;
  explored: boolean;
}

export interface WorldMapData {
  game_id: number;
  tile_count: number;
  tiles: MapTile[];
  terrain_types: string[];
}

export interface TerrainTrait {
  name: string;
  color: string;
  defense_bonus?: number;
  movement_cost?: number;
  food_bonus?: number;
  wood_bonus?: number;
  gold_bonus?: number;
  stone_bonus?: number;
  iron_bonus?: number;
  crystal_bonus?: number;
  soul_energy_bonus?: number;
  description: string;
}

export interface TerrainInfo {
  terrain_types: { [key: string]: TerrainTrait };
}

/**
 * Generate a new world map for a game
 */
export const generateWorldMap = async (gameId: number, radius: number = 10): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/map/generate/${gameId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ radius }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate world map');
  }

  return response.json();
};

/**
 * Get the world map for a game
 */
export const getWorldMap = async (gameId: number): Promise<WorldMapData> => {
  const response = await fetch(`${API_BASE_URL}/map/${gameId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load world map');
  }

  return response.json();
};

/**
 * Get a specific tile
 */
export const getTile = async (gameId: number, q: number, r: number): Promise<MapTile> => {
  const response = await fetch(`${API_BASE_URL}/map/tile/${gameId}/${q}/${r}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load tile');
  }

  return response.json();
};

/**
 * Occupy a tile (mark as player or enemy controlled)
 */
export const occupyTile = async (
  gameId: number,
  q: number,
  r: number,
  occupiedBy: 'player' | 'enemy' | null
): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/map/tile/${gameId}/${q}/${r}/occupy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ occupied_by: occupiedBy }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to occupy tile');
  }

  return response.json();
};

/**
 * Mark a tile as explored
 */
export const exploreTile = async (gameId: number, q: number, r: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/map/tile/${gameId}/${q}/${r}/explore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to explore tile');
  }

  return response.json();
};

/**
 * Get neighboring tiles
 */
export const getNeighbors = async (gameId: number, q: number, r: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/map/neighbors/${gameId}/${q}/${r}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load neighbors');
  }

  return response.json();
};

/**
 * Get terrain type information
 */
export const getTerrainInfo = async (): Promise<TerrainInfo> => {
  const response = await fetch(`${API_BASE_URL}/map/terrain-info`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load terrain info');
  }

  return response.json();
};

/**
 * Convert axial coordinates to pixel coordinates for rendering
 */
export const axialToPixel = (q: number, r: number, hexSize: number): { x: number; y: number } => {
  const x = hexSize * (3 / 2) * q;
  const y = hexSize * (Math.sqrt(3) / 2) * q + hexSize * Math.sqrt(3) * r;
  return { x, y };
};

/**
 * Convert pixel coordinates to axial coordinates
 */
export const pixelToAxial = (x: number, y: number, hexSize: number): { q: number; r: number } => {
  const q = ((2 / 3) * x) / hexSize;
  const r = ((-1 / 3) * x + (Math.sqrt(3) / 3) * y) / hexSize;
  return { q: Math.round(q), r: Math.round(r) };
};
