import { PhaseType } from './phase';
import type { 
  GroupStagePhase, 
  SingleKnockoutPhase, 
  MultiKnockoutPhase, 
  Phase 
} from './tournamentConfig';

/**
 * Creates a default Group Stage phase
 */
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
      direct_advance_per_group: 2,
      number_of_legs: 1
    },
  };
}

/**
 * Creates a default Single-Branch Knockout phase
 */
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
      third_place_match: false
    },
  };
}

/**
 * Creates a default Multi-Branch Knockout phase (Double Elimination by default)
 */
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
      number_of_legs: 1,
    },
  };
}

/**
 * Generic factory dispatcher to create any phase by its PhaseType numeric enum
 */
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
    default: {
      const _exhaustiveCheck: never = type;
      throw new Error(`Unsupported phase type: ${_exhaustiveCheck}`);
    }
  }
}