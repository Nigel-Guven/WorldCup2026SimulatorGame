import { useState, useMemo } from "react";
import RankingsTable from "../components/rankings/RankingsTable";
import { useRankings } from "../hooks/useRankings";

const CONFEDERATIONS = [
    { label: "All", value: "ALL" },
    { label: "UEFA", value: "UEFA" },
    { label: "CONMEBOL", value: "CONMEBOL" },
    { label: "CONCACAF", value: "CONCACAF" },
    { label: "CAF", value: "CAF" },
    { label: "AFC", value: "AFC" },
    { label: "OFC", value: "OFC" },
];

export default function RankingsPage() {
    const { 
        teams, 
        loading, 
        error, 
        selectedConfederation, 
        setSelectedConfederation 
    } = useRankings();

    const [searchQuery, setSearchQuery] = useState("");

    // Client-side search filtering by ID or Name
    const filteredTeams = useMemo(() => {
        if (!searchQuery.trim()) return teams;
        const query = searchQuery.toLowerCase().trim();

        return teams.filter(
            (t) =>
                t.name?.toLowerCase().includes(query) ||
                t.id?.toString().toLowerCase().includes(query)
        );
    }, [teams, searchQuery]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    Global Football Rankings
                </h1>
                <p className="text-slate-400 mt-1">
                    Live global standings and official world rankings across regional confederations.
                </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by team name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Confederation Filter Buttons */}
                <div className="flex flex-wrap gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
                    {CONFEDERATIONS.map((conf) => {
                        const isActive = selectedConfederation === conf.value;
                        return (
                            <button
                                key={conf.value}
                                onClick={() => setSelectedConfederation(conf.value)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                                }`}
                            >
                                {conf.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                /* Skeleton Loader */
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-10 bg-slate-800/60 rounded-lg w-full" />
                    ))}
                </div>
            ) : error ? (
                /* Error Alert */
                <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-6 text-center text-red-400">
                    <p className="font-semibold">{error}</p>
                </div>
            ) : filteredTeams.length === 0 ? (
                /* Empty Search State */
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    <p className="text-lg font-medium">No teams match your search criteria.</p>
                    <p className="text-sm text-slate-500 mt-1">Try searching for a different ID or country name.</p>
                </div>
            ) : (
                /* Rankings Table */
                <RankingsTable teams={filteredTeams} />
            )}
        </div>
    );
}