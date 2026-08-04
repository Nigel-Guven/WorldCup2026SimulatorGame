import type { Country } from './country';
import { 
  PhaseType, 
  type GroupStageType, 
  type SingleBranchKnockoutType, 
  type MultiBranchKnockoutType 
} from './phase';

// --- ENUMS & CORE TYPES ---

export type TieBreakerRule = 
  | 'goal_difference' 
  | 'goals_scored' 
  | 'head_to_head' 
  | 'fair_play' 
  | 'drawing_of_lots';

// --- BASE PHASE INTERFACE ---

export interface BasePhase {
  id: string;
  name: string;
  tag: string; // E.g., "GS", "R16", "QF" - used for routing targets
  type: PhaseType;
  teams: Country[];
  is_active?: boolean;
  has_draw: boolean; // Triggers automated draw when phase kicks off
}


// --- 1. GROUP STAGE CONFIGURATION ---

export interface GroupStageConfig {
  number_of_groups: number;
  group_size?: number;
  
  direct_advance_per_group: number;
  wildcard_position?: number;
  wildcard_teams_count?: number;
  
  number_of_legs: 1 | 2;
  points_system?: {
    win: number;
    draw: number;
    loss: number;
  };
  tie_breaker_hierarchy?: TieBreakerRule[];
  avoid_same_confederation_draw?: boolean;

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
  
  extra_time_and_penalties?: boolean;
  away_goals_rule?: boolean;
  
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
  
  swiss_rounds?: number;
  swiss_wins_to_advance?: number;
  swiss_losses_to_eliminate?: number;

  include_full_classification?: boolean;

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
  return phase.type === PhaseType.GroupStage;
}

export function isSingleKnockoutPhase(phase: Phase): phase is SingleKnockoutPhase {
  return phase.type === PhaseType.SingleBranchKnockoutStage;
}

export function isMultiKnockoutPhase(phase: Phase): phase is MultiKnockoutPhase {
  return phase.type === PhaseType.MultiBranchKnockoutStage;
}