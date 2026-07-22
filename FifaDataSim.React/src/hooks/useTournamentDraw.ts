import { useState, useEffect, useCallback } from 'react';
import type { Country } from '../types/country';
import { tournamentService, type DrawSetup } from '../services/tournamentService';

export interface Group {
  name: string;
  teams: Country[];
}

export type PotKey = 'pot1' | 'pot2' | 'pot3' | 'pot4';

const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export function useTournamentDraw() {
  const [pots, setPots] = useState<DrawSetup | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentPotIndex, setCurrentPotIndex] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [drawHistory, setDrawHistory] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDrawSetup() {
      try {
        setLoading(true);
        const data = await tournamentService.getDrawSetup();
        if (!isMounted) return;

        setPots(data);
        setGroups(GROUP_NAMES.map((name) => ({ name, teams: [] })));
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDrawSetup();

    return () => {
      isMounted = false;
    };
  }, []);

  const drawNextTeam = useCallback(() => {
    if (!pots) return;

    const activePotKey: PotKey = `pot${currentPotIndex}` as PotKey;
    const activePot = pots[activePotKey];
    if (!activePot || activePot.length === 0) return;

    const targetGroupIndex = groups.findIndex(
      (g) => g.teams.length === currentPotIndex - 1
    );
    if (targetGroupIndex === -1) return;

    const randomIdx = Math.floor(Math.random() * activePot.length);
    const selectedTeam = activePot[randomIdx];
    const updatedPot = activePot.filter((_, idx) => idx !== randomIdx);

    const updatedGroups = groups.map((group, idx) => {
      if (idx === targetGroupIndex) {
        return { ...group, teams: [...group.teams, selectedTeam] };
      }
      return group;
    });

    setPots({ ...pots, [activePotKey]: updatedPot });
    setGroups(updatedGroups);
    setDrawHistory((prev) => [
      `Drew ${selectedTeam.name} (${selectedTeam.short_name}) into Group ${groups[targetGroupIndex].name}`,
      ...prev,
    ]);

    const totalTeamsInCurrentLayer = updatedGroups.filter(
      (g) => g.teams.length === currentPotIndex
    ).length;

    if (totalTeamsInCurrentLayer === 12 && currentPotIndex < 4) {
      setCurrentPotIndex((prev) => prev + 1);
    }
  }, [pots, groups, currentPotIndex]);

  const autoDrawAll = useCallback(() => {
    if (!pots) return;

    let currentPots = { ...pots };
    let currentGroups = groups.map((g) => ({ ...g, teams: [...g.teams] }));
    let potIdx = currentPotIndex;
    const historyLogs: string[] = [];

    while (potIdx <= 4) {
      const activePotKey: PotKey = `pot${potIdx}` as PotKey;
      const activePot = [...currentPots[activePotKey]];

      while (activePot.length > 0) {
        const targetGroupIndex = currentGroups.findIndex(
          (g) => g.teams.length === potIdx - 1
        );
        if (targetGroupIndex === -1) break;

        const randomIdx = Math.floor(Math.random() * activePot.length);
        const selectedTeam = activePot[randomIdx];
        activePot.splice(randomIdx, 1);

        currentGroups[targetGroupIndex].teams.push(selectedTeam);
        historyLogs.unshift(
          `Drew ${selectedTeam.name} into Group ${currentGroups[targetGroupIndex].name}`
        );
      }

      currentPots[activePotKey] = [];
      potIdx++;
    }

    setPots(currentPots);
    setGroups(currentGroups);
    setCurrentPotIndex(4);
    setDrawHistory((prev) => [...historyLogs, ...prev]);
  }, [pots, groups, currentPotIndex]);

  const isDrawComplete = pots
    ? pots.pot1.length === 0 &&
      pots.pot2.length === 0 &&
      pots.pot3.length === 0 &&
      pots.pot4.length === 0
    : false;

  return {
    pots,
    groups,
    currentPotIndex,
    loading,
    error,
    drawHistory,
    isDrawComplete,
    drawNextTeam,
    autoDrawAll,
  };
}