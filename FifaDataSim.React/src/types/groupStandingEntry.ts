import type { Country } from '../types/country';

export interface HeadToHeadRecord {
  points: number;
  goalDifference: number;
  goalsFor: number;
}

export interface DisciplinaryRecord {
  yellowCards: number;
  redCards: number; 
}

export interface GroupStandingEntry {
  team: Country;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  disciplinary?: DisciplinaryRecord;
  headToHead?: Record<string, HeadToHeadRecord>;
}