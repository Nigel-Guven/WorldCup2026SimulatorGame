import type { Country } from "../../types/country";
import type { KnockoutMatchup } from "../../types/knockoutMatchup";
import type { Phase } from "../../types/phase";
import { PhaseType } from "../../types/phaseType";
import type { Pot } from "../../types/pot";

export function derivePots(phase: Phase): Pot[] {
  if (!phase.teams.length) {
    return [];
  }

  if (phase.type === PhaseType.GroupStage) {
    const groupCount = phase.config.number_of_groups || 1;
    const groupSize = phase.config.group_size || 4;

    const potCount = Math.max(
      groupSize,
      Math.ceil(phase.teams.length / groupCount)
    );

    const pots: Pot[] = Array.from(
      { length: potCount },
      (_, index) => ({
        id: index + 1,
        name: `Pot ${index + 1}`,
        teams: [],
      })
    );

    phase.teams.forEach((team, index) => {
      const potIndex = Math.floor(index / groupCount);
      pots[potIndex]?.teams.push(team);
    });

    return pots;
  }

  if (phase.type === PhaseType.MultiBranchKnockoutStage) {
    const pathCount = phase.config.number_of_paths || 1;

    const pots: Pot[] = Array.from(
      { length: pathCount },
      (_, index) => ({
        id: index + 1,
        name: `Path ${index + 1} Seed Pool`,
        teams: [],
      })
    );

    phase.teams.forEach((team, index) => {
      const potIndex = index % pathCount;
      pots[potIndex]?.teams.push(team);
    });

    return pots;
  }

  // Single branch knockout
  const half = Math.ceil(phase.teams.length / 2);

  return [
    {
      id: 1,
      name: 'Pot 1 (Seeded)',
      teams: phase.teams.slice(0, half),
    },
    {
      id: 2,
      name: 'Pot 2 (Unseeded)',
      teams: phase.teams.slice(half),
    },
  ];
}

export function createFallbackGroupDraw(
  phase: Phase
): Record<string, Country[]> | null {
  if (phase.type !== PhaseType.GroupStage) {
    return null;
  }

  const groupCount = phase.config.number_of_groups || 1;
  const groups: Record<string, Country[]> = {};

  for (let index = 0; index < groupCount; index++) {
    const key = String.fromCharCode(65 + index);
    groups[key] = [];
  }

  phase.teams.forEach((team, index) => {
    const groupKey = String.fromCharCode(65 + (index % groupCount));
    groups[groupKey]?.push(team);
  });

  return groups;
}

export function createFallbackSingleKnockoutDraw(
  phase: Phase
): KnockoutMatchup[] {
  if (phase.type !== PhaseType.SingleBranchKnockoutStage) {
    return [];
  }

  const matchups: KnockoutMatchup[] = [];

  for (let index = 0; index < phase.teams.length; index += 2) {
    const matchNumber = Math.floor(index / 2) + 1;
    const matchId = `M${matchNumber}`;

    matchups.push({
      id: matchId,
      matchId,
      roundIndex: 0,
      isPlayed: false,
      teamA: phase.teams[index],
      teamB: phase.teams[index + 1] ?? null,
    });
  }

  return matchups;
}

export function createFallbackMultiKnockoutDraw(
  phase: Phase
): Record<string, KnockoutMatchup[]> {
  if (phase.type !== PhaseType.MultiBranchKnockoutStage) {
    return {};
  }

  const pathCount = phase.config.number_of_paths || 1;
  const paths: Record<string, KnockoutMatchup[]> = {};

  for (let index = 0; index < pathCount; index++) {
    const pathKey = `Path ${String.fromCharCode(65 + index)}`;
    paths[pathKey] = [];
  }

  const pathKeys = Object.keys(paths);

  for (let index = 0; index < phase.teams.length; index += 2) {
    const targetPath = pathKeys[Math.floor(index / 2) % pathCount];

    if (!targetPath) {
      continue;
    }

    const matchIndex = paths[targetPath].length + 1;
    const matchId = `${targetPath}-M${matchIndex}`;

    paths[targetPath].push({
      id: matchId,
      matchId,
      roundIndex: 0,
      isPlayed: false,
      teamA: phase.teams[index],
      teamB: phase.teams[index + 1] ?? null,
    });
  }

  return paths;
}