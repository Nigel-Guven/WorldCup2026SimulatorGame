import { useState, useCallback } from 'react';
import { extractAdvancingTeams } from '../services/helpers/qualificationUtils';
import type { Phase } from '../types/phase';
import type { PhaseCompletionData } from '../types/phaseCompletionData';

interface UseTournamentProgressionProps {
  initialPhases: Phase[];
  onTournamentComplete?: (finalPhases: Phase[]) => void;
}

export function useTournamentProgression({
  initialPhases,
  onTournamentComplete,
}: UseTournamentProgressionProps) {
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);

  const activePhase = phases[currentPhaseIndex];

  /**
   * Completes the current active phase, extracts qualified teams,
   * injects them into the subsequent phase, and advances the index.
   */
  const handleAdvanceToNextPhase = useCallback(
    (completionData: PhaseCompletionData) => {
      const isLastPhase = currentPhaseIndex >= phases.length - 1;

      if (isLastPhase) {
        onTournamentComplete?.(phases);
        return;
      }

      const qualifiedTeams = extractAdvancingTeams(activePhase, completionData);

      setPhases((prevPhases) => {
        const nextPhases = [...prevPhases];
        const nextPhaseIndex = currentPhaseIndex + 1;

        // Propagate qualified teams to next phase
        nextPhases[nextPhaseIndex] = {
          ...nextPhases[nextPhaseIndex],
          teams: qualifiedTeams,
        };

        return nextPhases;
      });

      setCurrentPhaseIndex((prevIndex) => prevIndex + 1);
    },
    [activePhase, currentPhaseIndex, phases, onTournamentComplete]
  );

  return {
    phases,
    activePhase,
    currentPhaseIndex,
    handleAdvanceToNextPhase,
  };
}