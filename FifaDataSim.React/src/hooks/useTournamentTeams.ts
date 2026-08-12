import { useEffect, useState } from 'react';
import type { Country } from '../types/country';
import type { Confederation } from '../types/confederation';
import { getTeamsByConfederation } from '../services/teamService';
import { CONFEDERATIONS } from '../types/confederationConfiguration';

export function useTournamentTeams() {
  const [teamsData, setTeamsData] =
    useState<Record<Confederation, Country[]>>({} as Record<Confederation, Country[]>);

  const [loadingStates, setLoadingStates] =
    useState<Record<Confederation, boolean>>({} as Record<Confederation, boolean>);

  const [errorStates, setErrorStates] =
    useState<Record<Confederation, string | null>>({} as Record<Confederation, string | null>);

  const loadTeams = async (confederation: Confederation): Promise<void> => {
    setLoadingStates((prev) => ({
      ...prev,
      [confederation]: true,
    }));

    setErrorStates((prev) => ({
      ...prev,
      [confederation]: null,
    }));

    try {
      const data = await getTeamsByConfederation(confederation);

      setTeamsData((prev) => ({
        ...prev,
        [confederation]: data,
      }));
    } catch (err) {
      setErrorStates((prev) => ({
        ...prev,
        [confederation]:
          err instanceof Error ? err.message : 'An unknown error occurred',
      }));
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [confederation]: false,
      }));
    }
  };

  useEffect(() => {
    CONFEDERATIONS.forEach((conf) => {
      loadTeams(conf.id);
    });
  }, []);

  return {
    teamsData,
    loadingStates,
    errorStates,
    loadTeams,
  };
}