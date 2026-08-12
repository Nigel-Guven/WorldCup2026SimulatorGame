import type { Country } from './country';

export interface PathWinnerSummary {
  pathId: string;
  pathName?: string;
  champion: Country;
  runnerUp: Country;
  thirdPlace?: Country;
}