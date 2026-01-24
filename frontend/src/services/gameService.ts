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

// API Service
export const gameService = {
  getClasses: (): Promise<AxiosResponse<ClassesResponse>> => 
    axios.get(endpoints.classes),
    
  getRaces: (): Promise<AxiosResponse<RacesResponse>> => 
    axios.get(endpoints.races),
    
  createHero: (heroData: HeroCreationData): Promise<AxiosResponse<HeroCreationResponse>> => 
    axios.post(endpoints.createHero, heroData),
};
