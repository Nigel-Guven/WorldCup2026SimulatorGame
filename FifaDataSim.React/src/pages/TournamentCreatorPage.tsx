import type { JSX } from 'react';

import { useTournamentTeams } from '../hooks/useTournamentTeams';
import { useTournamentBuilder } from '../hooks/useTournamentBuilder';
import { useTournamentExecution } from '../hooks/useTournamentExecution';
import { TournamentExecutionView } from '../components/tournament/execution/TournamentExecutionView';
import { TournamentHeader } from '../components/tournament/builder/TournamentsHeader';
import { AvailableTeamsPanel } from '../components/tournament/builder/AvailableTeamsPanel';
import { TournamentPhasesPanel } from '../components/tournament/builder/TournamentPhasesPanel';
import type { PhaseCompletionData } from '../types/phaseCompletionData';
import { extractQualifyingTeams } from '../services/helpers/extractQualifyingTeams';

export default function TournamentCreatorPage(): JSX.Element {
  const {
    teamsData,
    loadingStates,
    errorStates,
    loadTeams,
  } = useTournamentTeams();

  const {
    phases,
    selectedPhaseType,
    setSelectedPhaseType,
    assignedTeamIds,
    addPhase,
    removePhase,
    dropTeamToPhase,
    removeTeamFromPhase,
    updatePhaseConfig,
    updatePhaseMetadata,
    updatePhaseTeams,
  } = useTournamentBuilder();

  const execution = useTournamentExecution(phases);

  const handleNextPhase = (completionData: PhaseCompletionData) => {
    const nextPhaseIndex = execution.currentPhaseIndex + 1;

    if (nextPhaseIndex < phases.length && updatePhaseTeams) {
      const nextPhase = phases[nextPhaseIndex];
      const qualifyingTeams = extractQualifyingTeams(completionData, nextPhase);
      updatePhaseTeams(nextPhaseIndex, qualifyingTeams);
    }

    execution.nextPhase();
  };

  return (
    <div className="w-full px-2 sm:px-4 py-6 font-sans text-gray-800">
      <TournamentHeader
        isExecuting={execution.isExecuting}
        phaseCount={phases.length}
        onBeginTournament={execution.beginTournament}
      />

      {execution.isExecuting && execution.activePhase ? (
        <TournamentExecutionView
          phases={phases}
          execution={execution}
          onNextPhase={handleNextPhase}
          onExitExecution={execution.exitExecution}
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AvailableTeamsPanel
            teamsData={teamsData}
            loadingStates={loadingStates}
            errorStates={errorStates}
            assignedTeamIds={assignedTeamIds}
            onReload={loadTeams}
          />

          <TournamentPhasesPanel
            phases={phases}
            selectedPhaseType={selectedPhaseType}
            setSelectedPhaseType={setSelectedPhaseType}
            onAddPhase={addPhase}
            onDropTeam={dropTeamToPhase}
            onRemovePhase={removePhase}
            onRemoveTeam={removeTeamFromPhase}
            onUpdatePhaseConfig={updatePhaseConfig}
            onUpdatePhaseMetadata={updatePhaseMetadata}
          />
        </div>
      )}
    </div>
  );
}