import type { PhaseType } from './phaseType';
import type { Country } from './country';
import type { GroupStandingEntry } from './groupStandingEntry';
import type { PathWinnerSummary } from './pathWinnerSummary';

export interface PhaseCompletionData {
  phaseId: string;
  phaseType: PhaseType;
  groupStandings?: Record<string, GroupStandingEntry[]>;
  wildcardQualifiers?: Country[]; // Added optional wildcardQualifiers field
  knockoutWinners?: Country[];
  pathWinners?: Record<string, PathWinnerSummary>;
}