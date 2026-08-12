import type { JSX } from 'react';
import { PhaseType } from '../../../types/phaseType';
import type { Phase } from '../../../types/phase';
import type { Country } from '../../../types/country';
import { PhaseBox } from './PhaseBox';

interface TournamentPhasesPanelProps {
  phases: Phase[];

  selectedPhaseType: PhaseType;
  setSelectedPhaseType: (type: PhaseType) => void;

  onAddPhase: () => void;

  onDropTeam: (phaseId: string, team: Country) => void;
  onRemovePhase: (phaseId: string) => void;
  onRemoveTeam: (phaseId: string, teamId: string | number) => void;

  onUpdatePhaseConfig: (
    phaseId: string,
    config: Partial<Phase['config']>
  ) => void;

  onUpdatePhaseMetadata: (
    phaseId: string,
    updates: {
      name?: string;
      tag?: string;
      has_draw?: boolean;
    }
  ) => void;
}

export function TournamentPhasesPanel({
  phases,
  selectedPhaseType,
  setSelectedPhaseType,
  onAddPhase,
  onDropTeam,
  onRemovePhase,
  onRemoveTeam,
  onUpdatePhaseConfig,
  onUpdatePhaseMetadata,
}: TournamentPhasesPanelProps): JSX.Element {
  return (
    <div className="w-full lg:w-1/2 xl:w-5/12 bg-gray-50 rounded-2xl p-6 border border-gray-200 sticky top-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Tournament Phases
        </h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedPhaseType}
            onChange={(e) =>
              setSelectedPhaseType(Number(e.target.value) as PhaseType)
            }
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={PhaseType.GroupStage}>
              Group Stage
            </option>

            <option value={PhaseType.SingleBranchKnockoutStage}>
              Single Knockout
            </option>

            <option value={PhaseType.MultiBranchKnockoutStage}>
              Multi-Branch Knockout
            </option>
          </select>

          <button
            type="button"
            onClick={onAddPhase}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            + Add Phase
          </button>
        </div>
      </div>

      {phases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">
            No phases created yet.
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Select a phase type and click "+ Add Phase" to begin
            building your structure.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
          {phases.map((phase) => (
            <PhaseBox
              key={phase.id}
              phase={phase}
              allPhases={phases}
              onDropTeam={onDropTeam}
              onRemovePhase={onRemovePhase}
              onRemoveTeam={onRemoveTeam}
              onUpdatePhaseConfig={onUpdatePhaseConfig}
              onUpdatePhaseMetadata={onUpdatePhaseMetadata}
            />
          ))}
        </div>
      )}
    </div>
  );
}