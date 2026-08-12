import { useState, useEffect } from "react";
import type { DragEvent } from "react";
import type { Country } from "../../../types/country";

interface TeamCardProps {
    team: Country;
    draggable?: boolean;
    onDragStart?: (e: DragEvent<HTMLLIElement>, team: Country) => void;
    removable?: boolean;
    onRemove?: () => void;
}

// Utility to normalize local paths vs absolute URLs safely across environments
const resolveFlagUrl = (url?: string) => {
    if (!url) return "";
    // If it's already a full HTTP/HTTPS URL, return as-is
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    
    // Ensure leading slash for public assets
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    
    // Uses Vite's base path if available, or defaults to root
    const baseUrl = import.meta.env?.BASE_URL || "/";
    return `${baseUrl.replace(/\/$/, "")}${cleanPath}`;
};

export default function TeamCard({
    team,
    draggable = false,
    onDragStart,
    removable = false,
    onRemove,
}: TeamCardProps) {
    const [imgError, setImgError] = useState(false);

    // Reset error state if team object or flag_url changes
    useEffect(() => {
        setImgError(false);
    }, [team.flag_url]);

    const formattedFlagUrl = resolveFlagUrl(team.flag_url);

    return (
        <li
            draggable={draggable}
            onDragStart={(e) => onDragStart?.(e, team)}
            className={`py-2 px-3 rounded-lg flex justify-between items-center gap-3 select-none ${
                draggable
                    ? "border border-gray-200 bg-white cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all"
                    : "border border-gray-200 bg-gray-50 shadow-sm"
            }`}
        >
            {/* Left Side: Drag Handle, Flag & Name */}
            <div className="flex items-center gap-2.5 min-w-0">
                {draggable && (
                    <div 
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-grab active:cursor-grabbing"
                        aria-hidden="true"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                    </div>
                )}

                {/* Flag Image with State-based Fallback */}
                {formattedFlagUrl && !imgError ? (
                    <img 
                        src={formattedFlagUrl} 
                        alt={`${team.name} flag`} 
                        className="w-6 h-4 object-cover rounded-sm shadow-sm border border-gray-100 flex-shrink-0"
                        loading="lazy"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    /* Fallback flag showing country short_name or fallback icon */
                    <div 
                        className="w-6 h-4 bg-gray-200 text-gray-600 font-bold text-[9px] flex items-center justify-center rounded-sm border border-gray-300 flex-shrink-0 uppercase"
                        title={team.name}
                    >
                        {team.short_name?.slice(0, 2) || "??"}
                    </div>
                )}

                <span className="font-medium text-sm text-gray-800 truncate">
                    {team.name}
                </span>
            </div>

            {/* Right Side: Metadata & Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {team.default_points !== undefined && team.default_points !== null && (
                    <span 
                        className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                        title="Default Points"
                    >
                        {team.default_points} pts
                    </span>
                )}

                {removable ? (
                    <button
                        onClick={onRemove}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-md transition-colors flex items-center justify-center"
                        title="Remove from phase"
                        aria-label={`Remove ${team.name}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                ) : (
                    team.id && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {team.id}
                        </span>
                    )
                )}
            </div>
        </li>
    );
}