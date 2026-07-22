import type { Country } from "../types/country";

export interface DrawSetup {
  pot1: Country[];
  pot2: Country[];
  pot3: Country[];
  pot4: Country[];
}

const API_BASE_URL = 'http://localhost:5002/api/tournament';

export const tournamentService = {
  async getDrawSetup(): Promise<DrawSetup> {
    const res = await fetch(`${API_BASE_URL}/draw-setup`);
    if (!res.ok) {
      throw new Error(`Failed to fetch draw setup: ${res.statusText}`);
    }
    return res.json();
  },
};