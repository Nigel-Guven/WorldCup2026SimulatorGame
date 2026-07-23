import { useState, useMemo, useCallback } from 'react';
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

  // 1. Compute total matchdays dynamically from actual fixtures
  const totalMatchdays = useMemo(() => {
    if (!session.fixtures || session.fixtures.length === 0) return 3;
    return Math.max(...session.fixtures.map((f) => f.matchday));
  }, [session.fixtures]);

  // 2. Filter fixtures by the active selected matchday tab
  const filteredFixtures = useMemo(() => {
    return session.fixtures.filter((f) => f.matchday === activeMatchday);
  }, [session.fixtures, activeMatchday]);

  // 3. Compute overall group stage completion
  const isGroupStageComplete = useMemo(() => {
    if (!session.fixtures || session.fixtures.length === 0) return false;
    return session.fixtures.every((f) => f.isPlayed);
  }, [session.fixtures]);

  // 4. Single match simulation (uses simulateFixture)
  const simulateMatch = useCallback(
    async (fixtureId: string) => {
      try {
        setError(null);
        const updatedSession = await tournamentService.simulateFixture(fixtureId);
        onSessionUpdate(updatedSession);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to simulate match');
      }
    },
    [onSessionUpdate]
  );

  // 5. Bulk simulation (uses simulateAllFixtures)
  const simulateAllUnplayed = useCallback(async () => {
    try {
      setSimulating(true);
      setError(null);
      const updatedSession = await tournamentService.simulateAllFixtures();
      onSessionUpdate(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simulate all matches');
    } finally {
      setSimulating(false);
    }
  }, [onSessionUpdate]);

  return {
    activeMatchday,
    setActiveMatchday,
    totalMatchdays,
    simulating,
    error,
    isGroupStageComplete,
    filteredFixtures,
    simulateMatch,
    simulateAllUnplayed,
  };
}