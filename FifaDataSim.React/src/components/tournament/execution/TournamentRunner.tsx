import { useState } from 'react';
import { TournamentExecutionView } from './TournamentExecutionView';
import type { Phase } from '../../../types/phase';
import { extractQualifyingTeams } from '../../../services/helpers/extractQualifyingTeams';
import type { PhaseCompletionData } from '../../../types/phaseCompletionData';
import { useTournamentExecution } from '../../../hooks/useTournamentExecution';

interface Props {
  initialPhases: Phase[];
  onFinish: () => void;
}

export function TournamentRunner({ initialPhases, onFinish }: Props) {
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  
  const execution = useTournamentExecution(phases);

  const handleNextPhase = (completionData: PhaseCompletionData) => {
    const isLastPhase = execution.currentPhaseIndex + 1 === phases.length;

    if (isLastPhase) {
      onFinish();
      return;
    }

    const nextPhaseIndex = execution.currentPhaseIndex + 1;
    const nextPhase = phases[nextPhaseIndex];

    // 1. Extract advancing teams using the completion payload
    const qualifyingTeams = extractQualifyingTeams(completionData, nextPhase);

    // 2. Immutably update the next phase's teams in state
    setPhases((prevPhases) =>
      prevPhases.map((phase, idx) =>
        idx === nextPhaseIndex ? { ...phase, teams: qualifyingTeams } : phase
      )
    );

    // 3. Advance execution hook to the next phase
    execution.nextPhase();
  };

  return (
    <TournamentExecutionView
      phases={phases}
      execution={execution}
      onNextPhase={handleNextPhase}
      onExitExecution={onFinish}
    />
  );
}