import { type DragEvent, type JSX } from 'react';
import type { ConfederationConfiguration } from '../../../types/confederationConfiguration';
import type { Country } from '../../../types/country';
import TeamCard from './TeamCard';
import type { Confederation } from '../../../types/confederation';

interface ConfederationBoxProps {
  conf: ConfederationConfiguration;
  teams: Country[];
  isLoading: boolean;
  error: string | null;
  onReload: (id: Confederation) => void;
}

export function ConfederationBox({
  conf,
  teams,
  isLoading,
  error,
  onReload,
}: ConfederationBoxProps): JSX.Element {
  const handleDragStart = (e: DragEvent<HTMLLIElement>, team: Country) => {
    e.dataTransfer.setData('application/json', JSON.stringify(team));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-md font-semibold text-gray-800">
          {conf.name} <span className="text-xs font-normal text-gray-500">({teams.length})</span>
        </h2>
        <button
          onClick={() => onReload(conf.id)}
          title="Refresh teams"
          className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Refresh teams"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex-grow h-64 overflow-y-auto">
        {isLoading && <p className="text-center text-sm text-gray-500 italic my-4">Loading teams...</p>}
        {error && <p className="text-center text-sm text-red-600 my-4">⚠️ {error}</p>}

        {!isLoading && !error && teams.length === 0 && (
          <p className="text-center text-sm text-gray-400 italic my-4">No available teams</p>
        )}

        {!isLoading && !error && teams.length > 0 && (
          <ul className="m-0 p-0 list-none space-y-2">
            {teams.map((team, index) => (
              <TeamCard
                key={team.id ?? index}
                team={team}
                draggable={true}
                onDragStart={handleDragStart}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}