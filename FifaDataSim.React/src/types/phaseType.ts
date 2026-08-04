export const PhaseType = {
    GroupStage: 0,
    SingleBranchKnockoutStage: 1,
    MultiBranchKnockoutStage: 2
} as const;

export type PhaseType = typeof PhaseType[keyof typeof PhaseType];