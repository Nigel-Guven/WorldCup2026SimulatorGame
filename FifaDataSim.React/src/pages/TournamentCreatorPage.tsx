import type { JSX } from 'react';

import { useTournamentTeams } from '../hooks/useTournamentTeams';
import { useTournamentBuilder } from '../hooks/useTournamentBuilder';
import { useTournamentExecution } from '../hooks/useTournamentExecution';
import { TournamentExecutionView } from '../components/tournament/execution/TournamentExecutionView';
import { TournamentHeader } from '../components/tournament/builder/TournamentsHeader';
import { AvailableTeamsPanel } from '../components/tournament/builder/AvailableTeamsPanel';
import { TournamentPhasesPanel } from '../components/tournament/builder/TournamentPhasesPanel';

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
  } = useTournamentBuilder();

  const {
    isExecuting,
    activePhase,
    currentPhaseIndex,

    beginTournament,
    nextPhase,
    exitExecution,
  } = useTournamentExecution(phases);

  return (
    <div className="w-full px-2 sm:px-4 py-6 font-sans text-gray-800">
      <TournamentHeader
        isExecuting={isExecuting}
        phaseCount={phases.length}
        onBeginTournament={beginTournament}
      />

      {isExecuting && activePhase ? (
        <TournamentExecutionView
          phases={phases}
          activePhase={activePhase}
          currentPhaseIndex={currentPhaseIndex}
          onNextPhase={nextPhase}
          onExitExecution={exitExecution}
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