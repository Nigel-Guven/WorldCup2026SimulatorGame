import type { JSX } from 'react';
import type { Country } from '../../../../types/country';
import { getTeamKey } from './GroupStageDrawView';

interface SlotRowProps {
  slotIdx: number;
  team?: Country;
  isFixedSeeding: boolean;
  selectedTeam: Country | null;
  onRemove?: (team: Country) => void;
}

export function SlotRow({
  slotIdx,
  team,
  isFixedSeeding,
  selectedTeam,
  onRemove,
}: SlotRowProps): JSX.Element {
  const slotNumber = slotIdx + 1;

  if (team) {
    return (
      <div
        key={getTeamKey(team) ?? slotIdx}
        className="flex justify-between items-center bg-blue-50/60 border border-blue-200 text-blue-900 text-xs px-3 py-2 rounded-lg font-medium"
      >
        <span className="flex items-center gap-1.5 truncate">
          <strong className="text-blue-500 mr-1">{slotNumber}.</strong>
          {team.flag_url && (
            <img
              src={team.flag_url}
              alt={team.name}
              className="w-4 h-3 object-cover rounded shadow-xs inline-block"
            />
          )}
          <span className="truncate">{team.name}</span>
          {team.isStarred && (
            <span className="text-sm shrink-0" title="Starred Country">
              ⭐
            </span>
          )}
        </span>

        {!isFixedSeeding && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(team);
            }}
            className="text-blue-400 hover:text-red-500 text-xs font-bold px-1 shrink-0 cursor-pointer transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  const isAwaitingAssignment = !isFixedSeeding && selectedTeam;

  return (
    <div
      className={`text-xs px-3 py-2 rounded-lg border border-dashed flex items-center transition-colors ${
        isAwaitingAssignment
          ? 'border-amber-300 bg-amber-50/50 text-amber-700 font-medium'
          : 'border-gray-200 text-gray-300'
      }`}
    >
      <span className="mr-2 text-gray-300 font-semibold">{slotNumber}.</span>
      <span>
        {isAwaitingAssignment ? 'Click to assign selected team' : 'Empty Slot'}
      </span>
    </div>
  );
}