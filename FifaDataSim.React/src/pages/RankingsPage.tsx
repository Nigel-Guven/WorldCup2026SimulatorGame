import { useState, useMemo } from "react";
import RankingsTable from "../components/rankings/RankingsTable";
import { useRankings, type ConfederationFilter } from "../hooks/useRankings";

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
        /* Doubled container max-width, padding, and spacing */
        <div className="max-w-[160rem] mx-auto px-8 py-16 animate-fade-in space-y-12">
            {/* Header - Doubled text sizes & margins */}
            <div>
                <h1 className="text-7xl font-extrabold text-white tracking-tight">
                    Global Football Rankings
                </h1>
                <p className="text-slate-400 mt-3 text-2xl">
                    Live global standings and official world rankings across regional confederations.
                </p>
            </div>

            {/* Controls Bar - Doubled gaps */}
            <div className="flex flex-col md:flex-row gap-8 justify-between items-stretch md:items-center">
                {/* Search Input - Doubled input sizing, icons, & text */}
                <div className="relative flex-1 max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by team name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-20 pr-8 py-4 bg-slate-800/80 border-2 border-slate-700/80 rounded-2xl text-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Confederation Filter Buttons - Doubled text size & paddings */}
                <div className="flex flex-wrap gap-3 bg-slate-900/60 p-3 rounded-2xl border-2 border-slate-800">
                    {CONFEDERATIONS.map((conf) => {
                        const isActive = selectedConfederation === conf.value;
                        return (
                            <button
                                key={conf.value}
                                onClick={() => setSelectedConfederation(conf.value as ConfederationFilter)}
                                className={`px-6 py-4 text-xl font-semibold rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
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
                /* Skeleton Loader - Doubled sizes */
                <div className="bg-slate-900/50 border-2 border-slate-800 rounded-3xl p-12 space-y-8 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-20 bg-slate-800/60 rounded-xl w-full" />
                    ))}
                </div>
            ) : error ? (
                /* Error Alert */
                <div className="bg-red-950/40 border-2 border-red-800/60 rounded-3xl p-12 text-center text-red-400">
                    <p className="font-semibold text-2xl">{error}</p>
                </div>
            ) : filteredTeams.length === 0 ? (
                /* Empty Search State */
                <div className="bg-slate-900/40 border-2 border-slate-800 rounded-3xl p-24 text-center text-slate-400">
                    <p className="text-3xl font-medium">No teams match your search criteria.</p>
                    <p className="text-xl text-slate-500 mt-2">Try searching for a different ID or country name.</p>
                </div>
            ) : (
                /* Rankings Table */
                <RankingsTable teams={filteredTeams} />
            )}
        </div>
    );
}