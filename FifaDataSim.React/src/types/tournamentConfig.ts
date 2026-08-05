import type { Country } from './country';
import type { 
  PhaseType, 
  GroupStageType, 
  SingleBranchKnockoutType, 
  MultiBranchKnockoutType 
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

// --- 1. GROUP STAGE CONFIGURATION ---

export interface GroupStageConfig {
  number_of_legs: 1 | 2;
  number_of_groups: number;
  group_size?: number;
  direct_advance_per_group: number;
  wildcard_position?: number;
  wildcard_teams_count?: number;
  winners_to_phase_tag?: string;
  wildcards_to_phase_tag?: string;
}

export interface GroupStagePhase extends BasePhase {
  type: GroupStageType;
  config: GroupStageConfig;
}

// --- 2. SINGLE BRANCH KNOCKOUT CONFIGURATION ---

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

// --- 3. MULTI BRANCH KNOCKOUT CONFIGURATION ---

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

// --- DISCRIMINATED UNION TYPE FOR ALL PHASES ---

export type Phase = GroupStagePhase | SingleKnockoutPhase | MultiKnockoutPhase;

// --- HELPER TYPE GUARDS ---

export function isGroupStagePhase(phase: Phase): phase is GroupStagePhase {
  return phase.type === 0;
}

export function isSingleKnockoutPhase(phase: Phase): phase is SingleKnockoutPhase {
  return phase.type === 1;
}

export function isMultiKnockoutPhase(phase: Phase): phase is MultiKnockoutPhase {
  return phase.type === 2;
}