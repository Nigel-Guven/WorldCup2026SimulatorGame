import { useMemo, useState } from 'react';
import type { Country } from '../types/country';
import { createPhaseByType } from '../types/phaseFactory';
import { PhaseType } from '../types/phaseType';
import type { Phase } from '../types/phase';

export function useTournamentBuilder() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhaseType, setSelectedPhaseType] = useState<PhaseType>(
    PhaseType.GroupStage
  );

  const assignedTeamIds = useMemo(
    () =>
      new Set(
        phases.flatMap((phase) =>
          phase.teams
            .map((team) => team.id!)
            .filter(Boolean)
        )
      ),
    [phases]
  );

  const addPhase = () => {
    const count = phases.length + 1;

    let defaultName = `Phase ${count}`;
    let defaultTag = `P${count}`;

    switch (selectedPhaseType) {
      case PhaseType.GroupStage:
        defaultName = `Group Stage ${count}`;
        defaultTag = `GS${count}`;
        break;

      case PhaseType.SingleBranchKnockoutStage:
        defaultName = `Knockout Phase ${count}`;
        defaultTag = `KO${count}`;
        break;

      case PhaseType.MultiBranchKnockoutStage:
        defaultName = `Multi-Branch Phase ${count}`;
        defaultTag = `MB${count}`;
        break;

      case PhaseType.NationsLeagueStage:
        defaultName = `Nations League Phase ${count}`;
        defaultTag = `NL${count}`;
        break;
    }

    setPhases((current) => [
      ...current,
      createPhaseByType(
        selectedPhaseType,
        defaultName,
        defaultTag
      ),
    ]);
  };

  const removePhase = (phaseId: string) => {
    setPhases((current) =>
      current.filter((phase) => phase.id !== phaseId)
    );
  };

  const dropTeamToPhase = (
    phaseId: string,
    teams: Country | Country[]
  ) => {
    const incomingTeams = Array.isArray(teams) ? teams : [teams];
    const incomingIds = new Set(incomingTeams.map((t) => t.id));

    setPhases((current) =>
      current.map((phase) => {
        // Remove any of the incoming teams from other phases / existing list
        const cleanedTeams = phase.teams.filter(
          (t) => t.id === undefined || !incomingIds.has(t.id)
        );

        if (phase.id === phaseId) {
          return {
            ...phase,
            teams: [...cleanedTeams, ...incomingTeams],
          };
        }

        return {
          ...phase,
          teams: cleanedTeams,
        };
      })
    );
  };

  const removeTeamFromPhase = (
    phaseId: string,
    teamId: string | number
  ) => {
    setPhases((current) =>
      current.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              teams: phase.teams.filter(
                (team) => team.id !== teamId
              ),
            }
          : phase
      )
    );
  };

  const updatePhaseConfig = (
    phaseId: string,
    updatedConfig: Partial<Phase['config']>
    ) => {
    setPhases((current) =>
        current.map((phase) => {
        if (phase.id !== phaseId) {
            return phase;
        }

        return {
            ...phase,
            config: {
            ...phase.config,
            ...updatedConfig,
            },
        } as Phase;
        })
    );
    };

  const updatePhaseMetadata = (
    phaseId: string,
    updates: {
      name?: string;
      tag?: string;
      has_draw?: boolean;
    }
  ) => {
    setPhases((current) =>
      current.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              ...updates,
            }
          : phase
      )
    );
  };

  return {
    phases,
    selectedPhaseType,
    setSelectedPhaseType,

    assignedTeamIds,

    addPhase,
    removePhase,

    dropTeamToPhase,
    removeTeamFromPhase,

    updatePhaseConfig,
    updatePhaseMetadata,
  };
}