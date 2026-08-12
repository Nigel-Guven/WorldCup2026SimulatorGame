import type { GroupStagePhase, MultiKnockoutPhase, NationsLeaguePhase, SingleKnockoutPhase } from "./tournamentConfiguration";

export type Phase = GroupStagePhase | SingleKnockoutPhase | MultiKnockoutPhase | NationsLeaguePhase;

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

export function isNationsLeaguePhase(phase: Phase): phase is NationsLeaguePhase {
  return phase.type === 3;
}