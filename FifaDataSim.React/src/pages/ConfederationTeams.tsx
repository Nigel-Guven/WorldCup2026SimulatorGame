import { useState, useEffect, type JSX } from 'react';
import type { Country } from '../types/country';
import type { Phase } from '../types/tournament';
import { getTeamsByConfederation } from '../services/teamService';
import { CONFEDERATIONS, type Confederation } from '../types/confederation';
import { ConfederationBox } from '../components/confederations/ConfederationBox';
import { PhaseBox } from '../components/confederations/PhaseBox';

export default function ConfederationTeams(): JSX.Element {
  const [teamsData, setTeamsData] = useState<Record<Confederation, Country[]>>({} as Record<Confederation, Country[]>);
  const [loadingStates, setLoadingStates] = useState<Record<Confederation, boolean>>({} as Record<Confederation, boolean>);
  const [errorStates, setErrorStates] = useState<Record<Confederation, string | null>>({} as Record<Confederation, string | null>);

  const [phases, setPhases] = useState<Phase[]>([]);

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

  const handleAddPhase = () => {
    const newPhaseNumber = phases.length + 1;
    const newPhase: Phase = {
      id: `phase-${Date.now()}`,
      name: `Phase ${newPhaseNumber}`,
      teams: [],
    };
    setPhases([...phases, newPhase]);
  };

  const handleRemovePhase = (phaseId: string) => {
    setPhases((currentPhases) => currentPhases.filter((p) => p.id !== phaseId));
  };

  const handleDropTeamToPhase = (phaseId: string, team: Country) => {
    setPhases((currentPhases) =>
      currentPhases.map((phase) => {
        const cleanedTeams = phase.teams.filter((t) => t.id !== team.id);

        if (phase.id === phaseId) {
          return { ...phase, teams: [...cleanedTeams, team] };
        }
        return { ...phase, teams: cleanedTeams };
      })
    );
  };

  const handleRemoveTeamFromPhase = (phaseId: string, teamId: string | number) => {
    setPhases((currentPhases) =>
      currentPhases.map((phase) => {
        if (phase.id === phaseId) {
          return { ...phase, teams: phase.teams.filter((t) => t.id !== teamId) };
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
          Drag teams from the confederations on the left into your tournament phases on the right.
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

        {/* RIGHT COLUMN: Phases */}
        <div className="w-full lg:w-1/2 xl:w-5/12 bg-gray-50 rounded-2xl p-6 border border-gray-200 sticky top-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Tournament Phases</h2>
            <button
              onClick={handleAddPhase}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
            >
              + Add Phase
            </button>
          </div>

          {phases.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">No phases created yet.</p>
              <p className="text-sm text-gray-400 mt-1">Click "+ Add Phase" to begin building your tournament.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {phases.map((phase) => (
                <PhaseBox
                  key={phase.id}
                  phase={phase}
                  onDropTeam={handleDropTeamToPhase}
                  onRemovePhase={handleRemovePhase}
                  onRemoveTeam={handleRemoveTeamFromPhase}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}