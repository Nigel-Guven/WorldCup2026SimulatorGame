import type { Country } from "./country";
import type { PhaseType } from "./phaseType";

export interface Phase {
    id: string;
    name: string;
    teams: Country[];
    phaseType: PhaseType;
}