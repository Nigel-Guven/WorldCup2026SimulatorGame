import type { Country } from './country';
import type { 
  PhaseType, 
  GroupStageType, 
  SingleBranchKnockoutType, 
  MultiBranchKnockoutType,
  NationsLeagueType 
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
  winners_to_phase_tag?: string;
  wildcards_to_phase_tag?: string;
  relegated_per_group?: number;
  playoff_qualifiers_per_group?: number;
  relegated_to_phase_tag?: string;
}

export interface GroupStagePhase extends BasePhase {
  type: GroupStageType;
  config: GroupStageConfig;
}

export interface NationsLeagueConfig {
  number_of_legs: 1 | 2;
  number_of_groups: number;
  group_size: number;
  direct_advance_per_group: number;
  relegated_per_group?: number;
  playoff_qualifiers_per_group?: number;
  winners_to_phase_tag?: string;
  relegated_to_phase_tag?: string;
}

export interface NationsLeaguePhase extends BasePhase {
  type: NationsLeagueType;
  config: NationsLeagueConfig;
}

export interface SingleKnockoutConfig {
  number_of_legs: 1 | 2;
  third_place_match: boolean;
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
  winners_to_phase_tag?: string;
  losers_to_phase_tag?: string;
}

export interface MultiKnockoutPhase extends BasePhase {
  type: MultiBranchKnockoutType;
  config: MultiKnockoutConfig;
}

export type Phase = 
  | GroupStagePhase 
  | NationsLeaguePhase 
  | SingleKnockoutPhase 
  | MultiKnockoutPhase;