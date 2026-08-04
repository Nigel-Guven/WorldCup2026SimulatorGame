import type { Confederation } from './confederation';
import type { Country } from './country';

export interface ConfederationConfig {
  id: Confederation;
  name: string;
}

export interface Phase {
  id: string;
  name: string;
  teams: Country[];
}