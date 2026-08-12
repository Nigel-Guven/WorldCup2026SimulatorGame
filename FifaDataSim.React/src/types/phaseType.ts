export const PhaseType = {
  GroupStage: 0,
  SingleBranchKnockoutStage: 1,
  MultiBranchKnockoutStage: 2,
  NationsLeagueStage: 3
} as const;

export type PhaseType = (typeof PhaseType)[keyof typeof PhaseType];

export type GroupStageType = typeof PhaseType.GroupStage;
export type SingleBranchKnockoutType = typeof PhaseType.SingleBranchKnockoutStage;
export type MultiBranchKnockoutType = typeof PhaseType.MultiBranchKnockoutStage;
export type NationsLeagueType = typeof PhaseType.NationsLeagueStage;