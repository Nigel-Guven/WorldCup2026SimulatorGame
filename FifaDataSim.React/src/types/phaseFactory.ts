import type { Phase } from './phase';
import { PhaseType } from './phaseType';
import type { 
  GroupStagePhase, 
  SingleKnockoutPhase, 
  MultiKnockoutPhase,
  SwissLeaguePhase
} from './tournamentConfiguration';

export function createGroupStagePhase(
  name: string = 'Group Stage',
  tag: string = 'GS'
): GroupStagePhase {
  return {
    id: crypto.randomUUID(),
    name,
    tag,
    type: PhaseType.GroupStage,
    teams: [],
    has_draw: true,
    is_active: false,
    config: {
      number_of_groups: 1,
      group_size: 4,
      direct_advance_per_group: 2,
      wildcard_position: 3,
      wildcard_teams_count: 1,
      number_of_legs: 1,
    },
  };
}

export function createSingleKnockoutPhase(
  name: string = 'Knockout Stage',
  tag: string = 'KO'
): SingleKnockoutPhase {
  return {
    id: crypto.randomUUID(),
    name,
    tag,
    type: PhaseType.SingleBranchKnockoutStage,
    teams: [],
    has_draw: true,
    is_active: false,
    config: {
      number_of_legs: 1,
      third_place_match: false,
    },
  };
}

export function createMultiKnockoutPhase(
  name: string = 'Double Elimination',
  tag: string = 'DE'
): MultiKnockoutPhase {
  return {
    id: crypto.randomUUID(),
    name,
    tag,
    type: PhaseType.MultiBranchKnockoutStage,
    teams: [],
    has_draw: true,
    is_active: false,
    config: {
      number_of_legs: 2,
      number_of_paths: 1,
      third_place_match: false,
    },
  };
}

export function createSwissLeaguePhase(
  name: string = 'Swiss League',
  tag: string = 'SL'
): SwissLeaguePhase {
  return {
    id: crypto.randomUUID(),
    name,
    tag,
    type: PhaseType.SwissLeagueStage,
    teams: [],
    has_draw: true,
    is_active: false,
    config: {
      number_of_legs: 1,
      number_of_matches_per_team: 4,
      direct_advance_count: 2,
      playoff_position_start: 3,
      playoff_teams_count: 4,
    },
  };
}

export function createPhaseByType(
  type: PhaseType,
  name?: string,
  tag?: string
): Phase {
  switch (type) {
    case PhaseType.GroupStage:
      return createGroupStagePhase(name, tag);
    case PhaseType.SingleBranchKnockoutStage:
      return createSingleKnockoutPhase(name, tag);
    case PhaseType.MultiBranchKnockoutStage:
      return createMultiKnockoutPhase(name, tag);
    case PhaseType.SwissLeagueStage:
      return createSwissLeaguePhase(name, tag);
    default: {
      const _exhaustiveCheck: never = type;
      throw new Error(`Unsupported phase type: ${_exhaustiveCheck}`);
    }
  }
}