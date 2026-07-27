import { useEffect, useState } from 'react';
import type { TournamentSession } from '../types/tournamentSession';
import { tournamentService } from '../services/tournamentService';


export function useTournamentSession() {
  const [session, setSession] =
    useState<TournamentSession | null>(null);


  useEffect(() => {
    loadSession();
  }, []);


  async function loadSession() {
    try {
      const existingSession =
        await tournamentService.getCurrentSession();

      setSession(existingSession);

    } catch {
      // No active tournament yet
      setSession(null);
    }
  }


  async function initializeTournament(
    drawnGroups: { name: string; teams: any[] }[]
  ) {
    try {
      const newSession =
        await tournamentService.initializeTournament(
          drawnGroups
        );

      setSession(newSession);

      return newSession;

    } catch (error) {
      console.error(error);
      alert('Error allocating scheduling context.');

      throw error;
    }
  }


  return {
    session,
    setSession,
    initializeTournament,
    reloadSession: loadSession,
  };
}