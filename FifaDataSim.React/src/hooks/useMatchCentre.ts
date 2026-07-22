import { useState, useMemo, useCallback } from 'react';
import type { MatchFixture } from '../types/matchFixture';
import type { TournamentSession } from '../types/tournamentSession';
import { tournamentService } from '../services/tournamentService';

interface UseMatchCentreProps {
  session: TournamentSession;
  onSessionUpdate: (updatedSession: TournamentSession) => void;
}

export function useMatchCentre({ session, onSessionUpdate }: UseMatchCentreProps) {
  const [activeMatchday, setActiveMatchday] = useState<number>(1);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isGroupStageComplete = useMemo(() => {
    return session.fixtures.length > 0 && session.fixtures.every((f) => f.isPlayed);
  }, [session.fixtures]);

  const filteredFixtures = useMemo(() => {
    return session.fixtures.filter(
      (f: MatchFixture) => f.matchday === activeMatchday
    );
  }, [session.fixtures, activeMatchday]);

  const simulateMatch = useCallback(
    async (fixtureId: string) => {
      try {
        setError(null);
        await tournamentService.simulateFixture(fixtureId);
        const updatedData = await tournamentService.getCurrentSession();
        onSessionUpdate(updatedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Simulation failed');
      }
    },
    [onSessionUpdate]
  );

  const simulateAllUnplayed = useCallback(async () => {
    setSimulating(true);
    setError(null);
    try {
      const updatedSession = await tournamentService.simulateAllFixtures();
      onSessionUpdate(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk calculation failure');
    } finally {
      setSimulating(false);
    }
  }, [onSessionUpdate]);

  return {
    activeMatchday,
    setActiveMatchday,
    simulating,
    error,
    isGroupStageComplete,
    filteredFixtures,
    simulateMatch,
    simulateAllUnplayed,
  };
}