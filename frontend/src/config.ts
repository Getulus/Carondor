// API base URL
export const API_URL: string = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const endpoints = {
  classes: `${API_URL}/classes`,
  races: `${API_URL}/races`,
  createHero: `${API_URL}/hero/create`,
} as const;
