import { useMemo, useState } from 'react';
import type { Phase } from '../types/phase';

export function useTournamentExecution(phases: Phase[]) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  const activePhase = useMemo(
    () => phases[currentPhaseIndex],
    [phases, currentPhaseIndex]
  );

  const beginTournament = () => {
    if (phases.length === 0) return;

    setCurrentPhaseIndex(0);
    setIsExecuting(true);
  };

  const nextPhase = () => {
    if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhaseIndex((prev) => prev + 1);
    } else {
      setIsExecuting(false);
      setCurrentPhaseIndex(0);
    }
  };

  const exitExecution = () => {
    setIsExecuting(false);
    setCurrentPhaseIndex(0);
  };

  return {
    isExecuting,
    currentPhaseIndex,
    activePhase,
    beginTournament,
    nextPhase,
    exitExecution,
  };
}