import { useState, useEffect, type JSX } from 'react';
import type { Country } from '../types/country';
import type { Phase } from '../types/tournamentConfig';
import { PhaseType } from '../types/phase';
import { getTeamsByConfederation } from '../services/teamService';
import { CONFEDERATIONS, type Confederation } from '../types/confederation';
import { ConfederationBox } from '../components/confederations/ConfederationBox';
import { PhaseBox } from '../components/confederations/PhaseBox';
import { createPhaseByType } from '../types/phaseFactory';

export default function ConfederationTeams(): JSX.Element {
  const [teamsData, setTeamsData] = useState<Record<Confederation, Country[]>>({} as Record<Confederation, Country[]>);
  const [loadingStates, setLoadingStates] = useState<Record<Confederation, boolean>>({} as Record<Confederation, boolean>);
  const [errorStates, setErrorStates] = useState<Record<Confederation, string | null>>({} as Record<Confederation, string | null>);

  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhaseType, setSelectedPhaseType] = useState<PhaseType>(PhaseType.GroupStage);

  useEffect(() => {
    CONFEDERATIONS.forEach((conf) => {
      loadTeams(conf.id);
    });
  }, []);

  const loadTeams = async (confederation: Confederation): Promise<void> => {
    setLoadingStates((prev) => ({ ...prev, [confederation]: true }));
    setErrorStates((prev) => ({ ...prev, [confederation]: null }));

    try {
      const data = await getTeamsByConfederation(confederation);
      setTeamsData((prev) => ({ ...prev, [confederation]: data }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setErrorStates((prev) => ({ ...prev, [confederation]: errorMessage }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [confederation]: false }));
    }
  };

  const assignedTeamIds = new Set<string | number>(
    phases.flatMap((phase) => phase.teams.map((team) => team.id!).filter(Boolean))
  );

  // Uses factory to create a fully initialized Phase instance with standard defaults
  const handleAddPhase = () => {
    const count = phases.length + 1;
    let defaultName = `Phase ${count}`;
    let defaultTag = `P${count}`;

    if (selectedPhaseType === PhaseType.GroupStage) {
      defaultName = `Group Stage ${count}`;
      defaultTag = `GS${count}`;
    } else if (selectedPhaseType === PhaseType.SingleBranchKnockoutStage) {
      defaultName = `Knockout Phase ${count}`;
      defaultTag = `KO${count}`;
    } else if (selectedPhaseType === PhaseType.MultiBranchKnockoutStage) {
      defaultName = `Multi-Branch Phase ${count}`;
      defaultTag = `MB${count}`;
    }

    const newPhase = createPhaseByType(selectedPhaseType, defaultName, defaultTag);
    setPhases((current) => [...current, newPhase]);
  };

  const handleRemovePhase = (phaseId: string) => {
    setPhases((currentPhases) => currentPhases.filter((p) => p.id !== phaseId));
  };

  const handleDropTeamToPhase = (phaseId: string, team: Country) => {
    setPhases((currentPhases) =>
      currentPhases.map((phase) => {
        // Prevent duplicate instances of team across any phase
        const cleanedTeams = phase.teams.filter((t) => t.id !== team.id);

        if (phase.id === phaseId) {
          return { ...phase, teams: [...cleanedTeams, team] } as Phase;
        }
        return { ...phase, teams: cleanedTeams } as Phase;
      })
    );
  };

  const handleRemoveTeamFromPhase = (phaseId: string, teamId: string | number) => {
    setPhases((currentPhases) =>
      currentPhases.map((phase) => {
        if (phase.id === phaseId) {
          return { ...phase, teams: phase.teams.filter((t) => t.id !== teamId) } as Phase;
        }
        return phase;
      })
    );
  };

  // Updates nested phase configuration options in state
  const handleUpdatePhaseConfig = (phaseId: string, updatedConfig: Partial<Phase['config']>) => {
    setPhases((currentPhases) =>
      currentPhases.map((phase) => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            config: {
              ...phase.config,
              ...updatedConfig,
            },
          } as Phase;
        }
        return phase;
      })
    );
  };

  // Updates top-level metadata like name, tag handle, or has_draw
  const handleUpdatePhaseMetadata = (
    phaseId: string,
    updates: { name?: string; tag?: string; has_draw?: boolean }
  ) => {
    setPhases((currentPhases) =>
      currentPhases.map((phase) => {
        if (phase.id === phaseId) {
          return { ...phase, ...updates } as Phase;
        }
        return phase;
      })
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 font-sans text-gray-800">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tournament Setup</h1>
        <p className="text-gray-600 mt-2">
          Drag teams from the confederations on the left into your tournament phases on the right. Configure rules per phase.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT COLUMN: Confederations */}
        <div className="w-full lg:w-1/2 xl:w-7/12">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Available Teams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CONFEDERATIONS.map((conf) => {
              const allConfTeams = teamsData[conf.id] || [];
              const availableTeams = allConfTeams.filter(
                (team) => team.id !== undefined && !assignedTeamIds.has(team.id)
              );

              return (
                <ConfederationBox
                  key={conf.id}
                  conf={conf}
                  teams={availableTeams}
                  isLoading={loadingStates[conf.id]}
                  error={errorStates[conf.id]}
                  onReload={loadTeams}
                />
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Phases Builder */}
        <div className="w-full lg:w-1/2 xl:w-5/12 bg-gray-50 rounded-2xl p-6 border border-gray-200 sticky top-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Tournament Phases</h2>

            {/* Type selector & add button */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedPhaseType}
                onChange={(e) => setSelectedPhaseType(Number(e.target.value) as PhaseType)}
                className="text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={PhaseType.GroupStage}>Group Stage</option>
                <option value={PhaseType.SingleBranchKnockoutStage}>Single Knockout</option>
                <option value={PhaseType.MultiBranchKnockoutStage}>Multi-Branch Knockout</option>
              </select>

              <button
                type="button"
                onClick={handleAddPhase}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                + Add Phase
              </button>
            </div>
          </div>

          {phases.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">No phases created yet.</p>
              <p className="text-sm text-gray-400 mt-1">Select a phase type and click "+ Add Phase" to begin building your structure.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {phases.map((phase) => (
                <PhaseBox
                  key={phase.id}
                  phase={phase}
                  allPhases={phases}
                  onDropTeam={handleDropTeamToPhase}
                  onRemovePhase={handleRemovePhase}
                  onRemoveTeam={handleRemoveTeamFromPhase}
                  onUpdatePhaseConfig={handleUpdatePhaseConfig}
                  onUpdatePhaseMetadata={handleUpdatePhaseMetadata}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}