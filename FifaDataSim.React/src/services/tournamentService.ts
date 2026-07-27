import type { TournamentDrawSetupDto } from "../types/drawSetup";
import type { TournamentSession } from "../types/tournamentSession";

const API_BASE_URL = 'http://localhost:5002/api/tournament';

export const tournamentService = {

  async getDrawSetup(
    tournamentCode: string = "WORLD_CUP_2026"
  ): Promise<TournamentDrawSetupDto> {
    const res = await fetch(
      `${API_BASE_URL}/draw-setup?tournamentCode=${tournamentCode}`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch draw setup: ${res.statusText}`);
    }

    return res.json();
  },


  async getCurrentSession(): Promise<TournamentSession> {
    const res = await fetch(
      `${API_BASE_URL}/current-session`
    );

    if (!res.ok) {
      throw new Error('No active tournament session found');
    }

    return res.json();
  },


  async initializeTournament(
    drawnGroups: { name: string; teams: any[] }[]
  ): Promise<TournamentSession> {
    const res = await fetch(
      `${API_BASE_URL}/initialize`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(drawnGroups),
      }
    );

    if (!res.ok) {
      throw new Error(
        'Failed to initialize tournament'
      );
    }

    return res.json();
  },


  async simulateFixture(
    fixtureId: string
  ): Promise<TournamentSession> {
    const res = await fetch(
      `${API_BASE_URL}/fixtures/${fixtureId}/simulate`,
      {
        method: 'POST',
      }
    );

    if (!res.ok) {
      throw new Error('Simulation failed');
    }

    return res.json();
  },


  async simulateAllFixtures(): Promise<TournamentSession> {
    const res = await fetch(
      `${API_BASE_URL}/fixtures/simulate-all`,
      {
        method: 'POST',
      }
    );

    if (!res.ok) {
      throw new Error('Simulation failed');
    }

    return res.json();
  },
};