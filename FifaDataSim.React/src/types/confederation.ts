import type { ConfederationConfig } from "./tournament";

export const Confederation = {
    UEFA: 0,
    CONMEBOL: 1,
    CAF: 2,
    AFC: 3,
    CONCACAF: 4,
    OFC: 5
} as const;

export const CONFEDERATIONS: ConfederationConfig[] = [
  { id: Confederation.UEFA, name: 'UEFA (Europe)' },
  { id: Confederation.CONMEBOL, name: 'CONMEBOL (South America)' },
  { id: Confederation.CONCACAF, name: 'CONCACAF (North & Central America)' },
  { id: Confederation.CAF, name: 'CAF (Africa)' },
  { id: Confederation.AFC, name: 'AFC (Asia)' },
  { id: Confederation.OFC, name: 'OFC (Oceania)' },
];


export type Confederation = typeof Confederation[keyof typeof Confederation];