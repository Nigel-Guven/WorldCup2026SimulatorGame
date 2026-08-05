import { useState, type DragEvent, type JSX } from 'react';
import type { Country } from '../../types/country';
import type { Phase, GroupStagePhase, SingleKnockoutPhase, MultiKnockoutPhase } from '../../types/tournamentConfig';
import TeamCard from './TeamCard';
import { MultiKnockoutConfigForm } from '../../functions/MultiStageConfigForm';
import { GroupStageConfigForm } from '../../functions/GroupStageConfigForm';
import { PhaseType } from '../../types/phaseType';
import { SingleKnockoutConfigForm } from '../../functions/SingleKnockoutConfigForm';

interface PhaseBoxProps {
  phase: Phase;
  allPhases: Phase[]; // Passed down to populate "Winners To / Losers To" phase tag dropdowns
  onDropTeam: (phaseId: string, team: Country) => void;
  onRemovePhase: (phaseId: string) => void;
  onRemoveTeam: (phaseId: string, teamId: string | number) => void;
  onUpdatePhaseConfig: (phaseId: string, updatedConfig: Partial<Phase['config']>) => void;
  onUpdatePhaseMetadata?: (phaseId: string, updates: { name?: string; tag?: string; has_draw?: boolean }) => void;
}

export function PhaseBox({
  phase,
  allPhases,
  onDropTeam,
  onRemovePhase,
  onRemoveTeam,
  onUpdatePhaseConfig,
  onUpdatePhaseMetadata,
}: PhaseBoxProps): JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const teamData = e.dataTransfer.getData('application/json');
      if (teamData) {
        const team = JSON.parse(teamData) as Country;
        onDropTeam(phase.id, team);
      }
    } catch (err) {
      console.error('Failed to parse dropped team data', err);
    }
  };

  const handleConfigChange = (field: string, value: unknown) => {
    onUpdatePhaseConfig(phase.id, { [field]: value });
  };

  // Filter out the current phase so it doesn't route to itself
  const availableTargetPhases = allPhases.filter((p) => p.id !== phase.id);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white border-2 rounded-xl flex flex-col overflow-hidden transition-colors ${
        isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
            {phase.tag}
          </span>
          <h2 className="text-md font-semibold text-gray-800 flex items-center gap-1">
            {phase.name}{' '}
            <span className="text-xs font-normal text-gray-500">({phase.teams.length} teams)</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsConfigOpen((prev) => !prev)}
            className="text-xs px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors cursor-pointer"
          >
            {isConfigOpen ? 'Hide Config' : '⚙️ Configure'}
          </button>
          <button
            type="button"
            onClick={() => onRemovePhase(phase.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            Remove Phase
          </button>
        </div>
      </div>

      {/* Collapsible Configuration Form */}
      {isConfigOpen && (
        <div className="bg-gray-50/80 p-4 border-b border-gray-200 text-xs space-y-4">
          {/* Common General Metadata */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Phase Tag Handle</label>
              <input
                type="text"
                value={phase.tag}
                onChange={(e) => onUpdatePhaseMetadata?.(phase.id, { tag: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
                placeholder="E.g. GS, R16"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Has Draw</label>
              <select
                value={phase.has_draw ? 'true' : 'false'}
                onChange={(e) => onUpdatePhaseMetadata?.(phase.id, { has_draw: e.target.value === 'true' })}
                className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
              >
                <option value="true">Yes</option>
                <option value="false">No (Fixed Seeding)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Number of Legs</label>
              <select
                value={phase.config.number_of_legs}
                onChange={(e) => handleConfigChange('number_of_legs', Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
              >
                <option value={1}>1 Leg (Single Match)</option>
                <option value={2}>2 Legs (Home & Away)</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Phase-Type Specific Settings */}
          {phase.type === PhaseType.GroupStage && (
            <GroupStageConfigForm
              config={(phase as GroupStagePhase).config}
              targetPhases={availableTargetPhases}
              onChange={handleConfigChange}
            />
          )}

          {phase.type === PhaseType.SingleBranchKnockoutStage && (
            <SingleKnockoutConfigForm
              config={(phase as SingleKnockoutPhase).config}
              targetPhases={availableTargetPhases}
              onChange={handleConfigChange}
            />
          )}

          {phase.type === PhaseType.MultiBranchKnockoutStage && (
            <MultiKnockoutConfigForm
              config={(phase as MultiKnockoutPhase).config}
              targetPhases={availableTargetPhases}
              onChange={handleConfigChange}
            />
          )}
        </div>
      )}

      {/* Team Dropzone */}
      <div className="p-4 min-h-[120px]">
        {phase.teams.length === 0 ? (
          <div className="h-full py-6 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm italic">Drag and drop teams here</p>
          </div>
        ) : (
          <ul className="space-y-2 m-0 p-0 list-none">
            {phase.teams.map((team: Country, index: number) => (
              <TeamCard
                key={team.id ?? index}
                team={team}
                removable={true}
                onRemove={() => team.id !== undefined && onRemoveTeam(phase.id, team.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}