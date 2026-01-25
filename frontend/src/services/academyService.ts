/**
 * Academy and talent system service
 */

import { API_URL } from '../config';

export interface TalentBonus {
  [key: string]: number;
}

export interface TalentInfo {
  talent_id: string;
  name: string;
  category: string;
  max_level: number;
  cost_per_level: number;
  description: string;
  bonus: TalentBonus;
}

export interface InvestedTalent {
  id: number;
  talent_id: string;
  name: string;
  category: string;
  level: number;
  max_level: number;
  cost_per_level: number;
  description: string;
  current_bonus: TalentBonus;
}

export interface TalentData {
  talents: InvestedTalent[];
  available_talents: TalentInfo[];
  talent_points_total: number;
  talent_points_used: number;
  talent_points_remaining: number;
}

export interface ActiveBonuses {
  resource_multipliers: { [key: string]: number };
  unit_bonuses: { [key: string]: number };
  special_effects: Array<{
    source: string;
    effect: string;
    value: number;
  }>;
}

/**
 * Get all talents for a game
 */
export const getTalents = async (gameId: number): Promise<TalentData> => {
  const response = await fetch(`${API_URL}/academy/${gameId}/talents`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load talents');
  }

  return response.json();
};

/**
 * Invest a talent point
 */
export const investTalent = async (gameId: number, talentId: string): Promise<any> => {
  const response = await fetch(`${API_URL}/academy/${gameId}/talents/${talentId}/invest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to invest talent');
  }

  return response.json();
};

/**
 * Refund a talent point (costs gold)
 */
export const refundTalent = async (gameId: number, talentId: string): Promise<any> => {
  const response = await fetch(`${API_URL}/academy/${gameId}/talents/${talentId}/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to refund talent');
  }

  return response.json();
};

/**
 * Get all active bonuses from talents and special buildings
 */
export const getActiveBonuses = async (gameId: number): Promise<ActiveBonuses> => {
  const response = await fetch(`${API_URL}/academy/${gameId}/bonuses`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to load bonuses');
  }

  return response.json();
};
