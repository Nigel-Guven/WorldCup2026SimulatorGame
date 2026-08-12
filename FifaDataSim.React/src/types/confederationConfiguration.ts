import { Confederation } from './confederation';

export interface ConfederationConfiguration {
  id: Confederation;
  name: string;
}

export const CONFEDERATIONS: ConfederationConfiguration[] = [
  { id: Confederation.UEFA, name: 'UEFA (Europe)' },
  { id: Confederation.CONMEBOL, name: 'CONMEBOL (South America)' },
  { id: Confederation.CONCACAF, name: 'CONCACAF (North & Central America)' },
  { id: Confederation.CAF, name: 'CAF (Africa)' },
  { id: Confederation.AFC, name: 'AFC (Asia)' },
  { id: Confederation.OFC, name: 'OFC (Oceania)' },
];