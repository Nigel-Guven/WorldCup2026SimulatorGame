import { useState } from 'react';
import { TournamentExecutionView } from './TournamentExecutionView';
import type { Phase } from '../../../types/phase';
import { extractQualifyingTeams } from '../../../services/helpers/extractQualifyingTeams';
import type { PhaseCompletionData } from '../../../types/phaseCompletionData';

interface Props {
  initialPhases: Phase[];
  onFinish: () => void;
}

export function TournamentRunner({ initialPhases, onFinish }: Props) {
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);

  const activePhase = phases[currentPhaseIndex];

  const handleNextPhase = (completionData: PhaseCompletionData) => {
    const isLastPhase = currentPhaseIndex + 1 === phases.length;

    if (isLastPhase) {
      onFinish();
      return;
    }

    const nextPhaseIndex = currentPhaseIndex + 1;
    const nextPhase = phases[nextPhaseIndex];

    // 1. Extract advancing teams using the completion payload
    const qualifyingTeams = extractQualifyingTeams(completionData, nextPhase);

    // 2. Immutably update the next phase's teams in state
    setPhases((prevPhases) =>
      prevPhases.map((phase, idx) =>
        idx === nextPhaseIndex ? { ...phase, teams: qualifyingTeams } : phase
      )
    );

    // 3. Advance execution view to the next phase
    setCurrentPhaseIndex(nextPhaseIndex);
  };

  return (
    <TournamentExecutionView
      phases={phases}
      activePhase={activePhase}
      currentPhaseIndex={currentPhaseIndex}
      onNextPhase={handleNextPhase}
      onExitExecution={onFinish}
    />
  );
}