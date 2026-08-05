import type { Phase } from './tournamentConfig';

export interface FormProps<T> {
  config: T;
  targetPhases: Phase[];
  onChange: (field: string, value: unknown) => void;
}