export const Confederation = {
  UEFA: 0,
  CONMEBOL: 1,
  CAF: 2,
  AFC: 3,
  CONCACAF: 4,
  OFC: 5,
} as const;

export type Confederation = (typeof Confederation)[keyof typeof Confederation];