import type { Country } from './country';
import type { 
  PhaseType, 
  GroupStageType, 
  SingleBranchKnockoutType, 
  MultiBranchKnockoutType,
  SwissLeagueType
} from './phaseType';

export interface BasePhase {
  id: string;
  name: string;
  tag: string;
  type: PhaseType;
  teams: Country[];
  is_active?: boolean;
  has_draw: boolean;
}

export interface GroupStageConfig {
  number_of_legs: 1 | 2;
  number_of_groups: number;
  group_size?: number;
  direct_advance_per_group: number;
  wildcard_position?: number;
  wildcard_teams_count?: number;
  match_importance?: number;
  winners_to_phase_tag?: string;
  wildcards_to_phase_tag?: string;
  relegated_to_phase_tag?: string;
}

export interface GroupStagePhase extends BasePhase {
  type: GroupStageType;
  config: GroupStageConfig;
}

export interface SingleKnockoutConfig {
  number_of_legs: 1 | 2;
  third_place_match: boolean;
  match_importance?: number;
  winners_to_phase_tag?: string;
  losers_to_phase_tag?: string;
}

export interface SingleKnockoutPhase extends BasePhase {
  type: SingleBranchKnockoutType;
  config: SingleKnockoutConfig;
}

export interface MultiKnockoutConfig {
  number_of_legs: 1 | 2;
  number_of_paths: number;
  third_place_match?: boolean;
  match_importance?: number;
  winners_to_phase_tag?: string;
  losers_to_phase_tag?: string;
}

export interface MultiKnockoutPhase extends BasePhase {
  type: MultiBranchKnockoutType;
  config: MultiKnockoutConfig;
}

export interface SwissLeagueConfig {
  number_of_legs: 1 | 2;
  number_of_matches_per_team: number;
  direct_advance_count: number;
  playoff_position_start?: number;
  playoff_teams_count?: number;
  match_importance?: number;
  winners_to_phase_tag?: string;
  wildcards_to_phase_tag?: string;
  relegated_to_phase_tag?: string;
  teams: Country[];
}

export interface SwissLeaguePhase extends BasePhase {
  type: SwissLeagueType;
  config: SwissLeagueConfig;
}

export type Phase = 
  | GroupStagePhase  
  | SingleKnockoutPhase 
  | MultiKnockoutPhase
  | SwissLeaguePhase;