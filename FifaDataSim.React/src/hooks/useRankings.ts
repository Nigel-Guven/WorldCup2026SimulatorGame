import { useEffect, useState, useCallback } from "react";
import { getTeams, getTeamsByConfederation } from "../services/teamService";
import type { Country } from "../types/country";
import type { Confederation } from "../types/confederation";

// Define a type for UI filter selection
export type ConfederationFilter = Confederation | "ALL";

export function useRankings() {
    const [teams, setTeams] = useState<Country[]>([]);
    const [selectedConfederation, setSelectedConfederation] = useState<ConfederationFilter>("ALL");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRankings = useCallback(async (confederation: ConfederationFilter) => {
        setLoading(true);
        setError(null);
        try {
            const data = confederation === "ALL"
                ? await getTeams()
                : await getTeamsByConfederation(confederation);
            setTeams(data);
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRankings(selectedConfederation);
    }, [selectedConfederation, fetchRankings]);

    return { 
        teams, 
        loading, 
        error, 
        selectedConfederation, 
        setSelectedConfederation 
    };
}