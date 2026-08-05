import type { JSX } from 'react';

import { useTournamentTeams } from '../hooks/useTournamentTeams';
import { useTournamentBuilder } from '../hooks/useTournamentBuilder';
import { useTournamentExecution } from '../hooks/useTournamentExecution';
import { TournamentHeader } from '../components/confederations/TournamentsHeader';
import { TournamentExecutionView } from '../components/confederations/TournamentExecutionView';
import { AvailableTeamsPanel } from '../components/confederations/AvailableTeamsPanel';
import { TournamentPhasesPanel } from '../components/confederations/TournamentPhasesPanel';

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
    <div className="max-w-[1600px] mx-auto px-4 py-8 font-sans text-gray-800">
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