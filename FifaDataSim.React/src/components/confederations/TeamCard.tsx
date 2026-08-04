import type { Country } from "../../types/country";
import type { DragEvent } from "react";

interface TeamCardProps {
    team: Country;

    draggable?: boolean;
    onDragStart?: (e: DragEvent<HTMLLIElement>, team: Country) => void;

    removable?: boolean;
    onRemove?: () => void;
}

export default function TeamCard({
    team,
    draggable = false,
    onDragStart,
    removable = false,
    onRemove,
}: TeamCardProps) {
    return (
        <li
            draggable={draggable}
            onDragStart={(e) => onDragStart?.(e, team)}
            className={`py-2 px-3 rounded-lg flex justify-between items-center ${
                draggable
                    ? "border border-gray-100 bg-white cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-sm transition-all"
                    : "border border-gray-200 bg-white shadow-sm"
            }`}
        >
            <span className="font-medium text-sm text-gray-800">
                {team.name}
            </span>

            {removable ? (
                <button
                    onClick={onRemove}
                    className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                    title="Remove from phase"
                >
                    ✕
                </button>
            ) : (
                team.id && (
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {team.id}
                    </span>
                )
            )}
        </li>
    );
}