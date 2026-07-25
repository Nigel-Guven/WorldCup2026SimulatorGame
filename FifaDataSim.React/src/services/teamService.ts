import type { Country } from "../types/country";

const API_URL = "http://localhost:5002/api";

export async function getTeams(): Promise<Country[]> {
    const response = await fetch(`${API_URL}/teams`);
    if (!response.ok) throw new Error("Failed to fetch team rankings");
    return response.json();
}

export async function getTeamById(id: string): Promise<Country> {
    const response = await fetch(`${API_URL}/teams/${id}`);
    if (!response.ok) throw new Error(`Team with ID '${id}' not found.`);
    return response.json();
}

export async function getTeamsByConfederation(confederation: string): Promise<Country[]> {
    const response = await fetch(`${API_URL}/teams/confederation/${confederation}`);
    if (!response.ok) throw new Error(`Failed to fetch rankings for ${confederation}`);
    return response.json();
}