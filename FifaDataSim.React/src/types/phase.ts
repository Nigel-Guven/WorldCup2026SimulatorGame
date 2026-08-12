import type { GroupStagePhase, MultiKnockoutPhase, SingleKnockoutPhase } from "./tournamentConfiguration";

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