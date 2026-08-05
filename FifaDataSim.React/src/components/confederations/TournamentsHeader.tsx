import type { JSX } from 'react';

interface TournamentHeaderProps {
  isExecuting: boolean;
  phaseCount: number;
  onBeginTournament: () => void;
}

export function TournamentHeader({
  isExecuting,
  phaseCount,
  onBeginTournament,
}: TournamentHeaderProps): JSX.Element {
  return (
    <header className="mb-8 border-b border-gray-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isExecuting ? 'Tournament Execution' : 'Tournament Setup'}
        </h1>

        <p className="text-gray-600 mt-1 text-sm">
          {isExecuting
            ? 'Executing created tournament phases in sequence.'
            : 'Drag teams from the confederations into tournament phases. Configure rules per phase.'}
        </p>
      </div>

      {!isExecuting && (
        <button
          type="button"
          onClick={onBeginTournament}
          disabled={phaseCount === 0}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-sm ${
            phaseCount > 0
              ? 'bg-green-600 hover:bg-green-700 cursor-pointer shadow-green-100'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          ▶ Begin Tournament ({phaseCount} {phaseCount === 1 ? 'Phase' : 'Phases'})
        </button>
      )}
    </header>
  );
}