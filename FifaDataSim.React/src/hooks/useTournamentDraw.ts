import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Country } from '../types/country';
import type { TournamentDrawSetupDto } from '../types/drawSetup';
import { tournamentService } from '../services/tournamentService';

export interface Group {
  name: string;
  teams: Country[];
}

export function useTournamentDraw(tournamentCode: string = 'WORLD_CUP_2026') {
  const [potsData, setPotsData] = useState<TournamentDrawSetupDto | null>(null);
  const [pots, setPots] = useState<Country[][]>([]);
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
        setError(null);

        // 1. Fetch full DTO from service
        const data: TournamentDrawSetupDto = await tournamentService.getDrawSetup(tournamentCode);
        if (!isMounted) return;

        // 2. Store full DTO
        setPotsData(data);

        // 3. Extract Country[][] array for hook's active state
        const fetchedPots = data.pots || [];
        setPots(fetchedPots);

        // 4. Derive group count from DTO
        const groupCount = data.numberOfGroups || 0;
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        const generatedGroups: Group[] = Array.from({ length: groupCount }, (_, idx) => ({
          name: alphabet[idx] || `Group ${idx + 1}`,
          teams: [],
        }));

        setGroups(generatedGroups);
        setCurrentPotIndex(1);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred during setup');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDrawSetup();

    return () => {
      isMounted = false;
    };
  }, [tournamentCode]);

  const totalPots = pots.length;

  // Max capacity per group driven by backend DTO
  const maxTeamsPerGroup = useMemo(() => {
    if (!potsData) return 0;
    if (potsData.numberOfTeamsPerGroup) return potsData.numberOfTeamsPerGroup;
    return potsData.numberOfGroups > 0
      ? Math.ceil(potsData.totalTeams / potsData.numberOfGroups)
      : 0;
  }, [potsData]);

  // Derive completion state dynamically across all pots
  const isDrawComplete = useMemo(() => {
    if (pots.length === 0) return false;
    return pots.every((pot) => pot.length === 0);
  }, [pots]);

  // Draw a single next team manually
  const drawNextTeam = useCallback(() => {
    if (!pots.length || isDrawComplete) return;

    const activePotIdx = currentPotIndex - 1;
    const activePot = pots[activePotIdx];
    if (!activePot || activePot.length === 0) return;

    // Find the current minimum team count among all groups
    const minTeamsCount = Math.min(...groups.map((g) => g.teams.length));

    // Cap check: avoid exceeding max team limit per group
    if (minTeamsCount >= maxTeamsPerGroup) return;

    // Pick the first group sitting at the minimum size
    const targetGroupIndex = groups.findIndex((g) => g.teams.length === minTeamsCount);
    if (targetGroupIndex === -1) return;

    // Pick a team randomly from the active pot
    const randomIdx = Math.floor(Math.random() * activePot.length);
    const selectedTeam = activePot[randomIdx];

    const updatedPot = activePot.filter((_, idx) => idx !== randomIdx);
    const updatedPots = pots.map((pot, idx) => (idx === activePotIdx ? updatedPot : pot));

    const updatedGroups = groups.map((group, idx) => {
      if (idx === targetGroupIndex) {
        return { ...group, teams: [...group.teams, selectedTeam] };
      }
      return group;
    });

    setPots(updatedPots);
    setGroups(updatedGroups);
    setDrawHistory((prev) => [
      `Drew ${selectedTeam.name} (${selectedTeam.short_name || selectedTeam.id}) into Group ${groups[targetGroupIndex].name}`,
      ...prev,
    ]);

    // Advance to next pot when current pot is completely emptied
    if (updatedPot.length === 0 && currentPotIndex < totalPots) {
      setCurrentPotIndex((prev) => prev + 1);
    }
  }, [pots, groups, currentPotIndex, totalPots, isDrawComplete, maxTeamsPerGroup]);

  // Auto-draw all remaining teams instantly
  const autoDrawAll = useCallback(() => {
    if (!pots.length || isDrawComplete) return;

    let currentPots = pots.map((p) => [...p]);
    let currentGroups = groups.map((g) => ({ ...g, teams: [...g.teams] }));
    let potIdx = currentPotIndex;
    const historyLogs: string[] = [];

    while (potIdx <= totalPots) {
      const activePotIdx = potIdx - 1;
      const activePot = currentPots[activePotIdx];

      while (activePot && activePot.length > 0) {
        const minTeamsCount = Math.min(...currentGroups.map((g) => g.teams.length));

        if (minTeamsCount >= maxTeamsPerGroup) break;

        const targetGroupIndex = currentGroups.findIndex((g) => g.teams.length === minTeamsCount);
        if (targetGroupIndex === -1) break;

        const randomIdx = Math.floor(Math.random() * activePot.length);
        const selectedTeam = activePot[randomIdx];
        activePot.splice(randomIdx, 1);

        currentGroups[targetGroupIndex].teams.push(selectedTeam);
        historyLogs.unshift(
          `Drew ${selectedTeam.name} into Group ${currentGroups[targetGroupIndex].name}`
        );
      }

      potIdx++;
    }

    setPots(currentPots);
    setGroups(currentGroups);
    setCurrentPotIndex(totalPots);
    setDrawHistory((prev) => [...historyLogs, ...prev]);
  }, [pots, groups, currentPotIndex, totalPots, isDrawComplete, maxTeamsPerGroup]);

  return {
    potsData,
    pots,
    groups,
    currentPotIndex,
    totalPots,
    loading,
    error,
    drawHistory,
    isDrawComplete,
    drawNextTeam,
    autoDrawAll,
  };
}