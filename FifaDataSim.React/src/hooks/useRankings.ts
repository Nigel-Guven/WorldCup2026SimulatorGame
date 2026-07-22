import { useEffect, useState } from "react";
import { getTeams } from "../services/teamService";
import type { Country } from "../types/country";

export function useRankings() {
    const [teams, setTeams] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getTeams()
            .then(setTeams)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    return { teams, loading, error };
}