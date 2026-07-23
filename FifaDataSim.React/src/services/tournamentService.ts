import type { TournamentDrawSetupDto } from "../types/drawSetup";
import type { TournamentSession } from "../types/tournamentSession";

const API_BASE_URL = 'http://localhost:5002/api/tournament';

export const tournamentService = {
  async getDrawSetup(tournamentCode: string = "WORLD_CUP_2026"): Promise<TournamentDrawSetupDto> {
    const res = await fetch(`${API_BASE_URL}/draw-setup?tournamentCode=${tournamentCode}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch draw setup: ${res.statusText}`);
    }
    // Returns the full object containing { tournamentCode, tournamentName, totalTeams, pots }
    return res.json();
  },
  
  async getCurrentSession(): Promise<TournamentSession> {
    const res = await fetch(`${API_BASE_URL}/current-session`);
    if (!res.ok) throw new Error('Failed to fetch current session');
    return res.json();
  },

  async simulateFixture(fixtureId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/fixtures/${fixtureId}/simulate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Match simulation failed');
  },

  async simulateAllFixtures(): Promise<TournamentSession> {
    const res = await fetch(`${API_BASE_URL}/fixtures/simulate-all`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Bulk simulation failed');
    return res.json();
  },
};