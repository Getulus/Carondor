import axios, { AxiosResponse } from 'axios';
import { endpoints } from '../config';

// Type definitions
export interface GameClass {
  id: string;
  name: string;
  health_point: number;
  physical_attack: number;
  physical_defense: number;
  magical_attack: number;
  magical_defense: number;
  description: string;
}

export interface Race {
  id: string;
  name: string;
  physical_bonus: number;
  magical_bonus: number;
  health_bonus: number;
  description: string;
}

export interface HeroStats {
  health_point: number;
  physical_attack: number;
  physical_defense: number;
  magical_attack: number;
  magical_defense: number;
}

export interface Hero {
  name: string;
  class: string;
  race: string;
  level: number;
  experience: number;
  stats: HeroStats;
  created_at: string;
}

export interface HeroCreationData {
  name: string;
  class: string;
  race: string;
}

export interface ClassesResponse {
  classes: GameClass[];
}

export interface RacesResponse {
  races: Race[];
}

export interface HeroCreationResponse {
  success: boolean;
  hero: Hero;
}

export interface ApiError {
  error: string;
}

// Game state interfaces
export interface Resources {
  [key: string]: number;
}

export interface Building {
  id: number;
  type: string;
  name: string;
  level: number;
  resource: string | null;
  production_per_minute: number;
  description: string;
  built_at: string;
  next_level_cost: Resources;
}

export interface Unit {
  id: number;
  type: string;
  race: string;
  name: string;
  count: number;
  attack: number;
  defense: number;
  hp: number;
  description: string;
  cost_per_unit: Resources;
  total_cost: Resources;
  hired_at: string;
}

export interface SavedGame {
  id: number;
  hero_name: string;
  hero_class: string;
  hero_race: string;
  level: number;
  experience: number;
  created_at: string;
  updated_at: string;
  resources: Resources;
  buildings: Building[];
  units: Unit[];
}

export interface SaveGameRequest {
  hero_name: string;
  hero_class: string;
  hero_race: string;
  level: number;
  experience: number;
  resources: Resources;
  buildings: Array<{ type: string; level: number }>;
  units: Array<{ type: string; race: string; count: number }>;
}

export interface SaveGameResponse {
  message: string;
  game_id: number;
  saved_at: string;
}

export interface BuildingType {
  type: string;
  name: string;
  description: string;
  resource: string | null;
  base_cost: Resources;
  production_per_minute: number;
}

export interface UnitType {
  type: string;
  name: string;
  description: string;
  cost: Resources;
  attack: number;
  defense: number;
  hp: number;
}

export interface ProductionRates {
  production_rates: Resources;
  calculated_at: string;
}

// API Service
export const gameService = {
  // Character creation
  getClasses: (): Promise<AxiosResponse<ClassesResponse>> => 
    axios.get(endpoints.classes),
    
  getRaces: (): Promise<AxiosResponse<RacesResponse>> => 
    axios.get(endpoints.races),
    
  createHero: (heroData: HeroCreationData): Promise<AxiosResponse<HeroCreationResponse>> => 
    axios.post(endpoints.createHero, heroData),

  // Game save/load
  saveGame: (gameData: SaveGameRequest): Promise<AxiosResponse<SaveGameResponse>> =>
    axios.post(`${endpoints.game}/save`, gameData),

  loadGame: (gameId: number): Promise<AxiosResponse<SavedGame>> =>
    axios.get(`${endpoints.game}/load/${gameId}`),

  listGames: (): Promise<AxiosResponse<Array<Omit<SavedGame, 'resources' | 'buildings' | 'units'>>>> =>
    axios.get(`${endpoints.game}/list`),

  // Town management
  getTownStatus: (gameId: number): Promise<AxiosResponse<SavedGame>> =>
    axios.get(`${endpoints.game}/town/${gameId}`),

  // Resources
  getResource: (gameId: number, resourceType: string): Promise<AxiosResponse<{ type: string; amount: number; name: string }>> =>
    axios.get(`${endpoints.game}/resource/${gameId}/${resourceType}`),

  updateResource: (gameId: number, resourceType: string, amount: number): Promise<AxiosResponse<{ type: string; amount: number; name: string }>> =>
    axios.post(`${endpoints.game}/resource/${gameId}/${resourceType}`, { amount }),

  getProductionRates: (gameId: number): Promise<AxiosResponse<ProductionRates>> =>
    axios.get(`${endpoints.game}/production/${gameId}`),

  // Buildings
  getBuildings: (gameId: number): Promise<AxiosResponse<Building[]>> =>
    axios.get(`${endpoints.game}/building/${gameId}`),

  createBuilding: (gameId: number, buildingType: string): Promise<AxiosResponse<{ message: string; building: Building }>> =>
    axios.post(`${endpoints.game}/building/${gameId}`, { building_type: buildingType }),

  upgradeBuilding: (buildingId: number): Promise<AxiosResponse<{ message: string; building: Building }>> =>
    axios.post(`${endpoints.game}/building/${buildingId}/upgrade`),

  getAvailableBuildings: (): Promise<AxiosResponse<BuildingType[]>> =>
    axios.get(`${endpoints.game}/buildings/available`),

  // Units
  getUnits: (gameId: number): Promise<AxiosResponse<Unit[]>> =>
    axios.get(`${endpoints.game}/unit/${gameId}`),

  recruitUnit: (gameId: number, unitType: string, race: string, count: number): Promise<AxiosResponse<{ message: string; unit: Unit }>> =>
    axios.post(`${endpoints.game}/unit/${gameId}/recruit`, { unit_type: unitType, race, count }),

  getAvailableUnits: (race: string): Promise<AxiosResponse<UnitType[]>> =>
    axios.get(`${endpoints.game}/units/available/${race}`),
};
