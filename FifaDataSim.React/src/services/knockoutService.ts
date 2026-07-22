import type { KnockoutBracket } from "../types/KnockoutBracket";

const API_BASE_URL = 'http://localhost:5002/api/tournament/knockout';

export const knockoutService = {
  async generateBracket(): Promise<KnockoutBracket> {
    const res = await fetch(`${API_BASE_URL}/generate`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to generate knockout bracket');
    return res.json();
  },

  async simulateMatch(matchId: string): Promise<KnockoutBracket> {
    const res = await fetch(`${API_BASE_URL}/simulate-match/${matchId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to simulate knockout match');
    return res.json();
  },
};