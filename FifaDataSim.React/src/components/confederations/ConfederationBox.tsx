import { type DragEvent, type JSX } from 'react';
import type { ConfederationConfig } from '../../types/tournament';
import type { Country } from '../../types/country';
import type { Confederation } from '../../types/confederation';
interface ConfederationBoxProps {
  conf: ConfederationConfig;
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
          className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
        >
          🔄
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
              <li
                key={team.id ?? index}
                draggable
                onDragStart={(e) => handleDragStart(e, team)}
                className="py-2 px-3 border border-gray-100 bg-white rounded-lg flex justify-between items-center cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="font-medium text-sm text-gray-800">{team.name}</span>
                {team.id && (
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    {team.id}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}