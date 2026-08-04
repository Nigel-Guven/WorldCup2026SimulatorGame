import { useState, DragEvent, type JSX } from 'react';
import type { Country } from '../types/country';
import type { Phase } from '../types/tournament';

interface PhaseBoxProps {
  phase: Phase;
  onDropTeam: (phaseId: string, team: Country) => void;
  onRemovePhase: (phaseId: string) => void;
  onRemoveTeam: (phaseId: string, teamId: string | number) => void;
}

export function PhaseBox({
  phase,
  onDropTeam,
  onRemovePhase,
  onRemoveTeam,
}: PhaseBoxProps): JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false);

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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white border-2 rounded-xl flex flex-col overflow-hidden transition-colors ${
        isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-dashed border-gray-300'
      }`}
    >
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-md font-semibold text-gray-800">
          {phase.name} <span className="text-xs font-normal text-gray-500">({phase.teams.length})</span>
        </h2>
        <button
          onClick={() => onRemovePhase(phase.id)}
          className="text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer"
        >
          Remove Phase
        </button>
      </div>

      <div className="p-4 min-h-[120px]">
        {phase.teams.length === 0 ? (
          <div className="h-full py-6 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm italic">Drag and drop teams here</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {phase.teams.map((team, index) => (
              <li
                key={team.id ?? index}
                className="py-2 px-3 border border-gray-200 bg-white rounded-lg flex justify-between items-center shadow-sm"
              >
                <span className="font-medium text-sm text-gray-800">{team.name}</span>
                <button
                  onClick={() => team.id && onRemoveTeam(phase.id, team.id)}
                  className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer"
                  title="Remove from phase"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}