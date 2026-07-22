import type { Country } from "../types/country";

const API_URL = "http://localhost:5002/api";

export async function getTeams(): Promise<Country[]> {
    const response = await fetch(`${API_URL}/teams`);

    if (!response.ok) {
        throw new Error("Failed to fetch team rankings");
    }

    return response.json();
}