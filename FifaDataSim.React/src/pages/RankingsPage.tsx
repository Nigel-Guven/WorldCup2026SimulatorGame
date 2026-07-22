import RankingsTable from "../components/rankings/RankingsTable";
import { useRankings } from "../hooks/useRankings";

export default function RankingsPage() {
    const { teams, loading, error } = useRankings();

    if (loading)
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-white">
                Loading...
            </div>
        );

    if (error)
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-red-400">
                {error}
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white">
                    Global Football Rankings
                </h1>
                <p className="text-slate-400">
                    Live standings calculated across active regional confederations.
                </p>
            </div>

            <RankingsTable teams={teams} />
        </div>
    );
}