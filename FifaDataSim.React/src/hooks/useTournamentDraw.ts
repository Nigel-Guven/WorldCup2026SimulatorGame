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

        const data: TournamentDrawSetupDto = await tournamentService.getDrawSetup(tournamentCode);
        if (!isMounted) return;

        setPotsData(data);
        setPots(data.pots || []);

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

  const maxTeamsPerGroup = useMemo(() => {
    if (!potsData) return 0;
    if (potsData.numberOfTeamsPerGroup) return potsData.numberOfTeamsPerGroup;
    return potsData.numberOfGroups > 0
      ? Math.ceil(potsData.totalTeams / potsData.numberOfGroups)
      : 0;
  }, [potsData]);

  const isDrawComplete = useMemo(() => {
    if (pots.length === 0) return false;
    return pots.every((pot) => pot.length === 0);
  }, [pots]);

  // --- NEW: Helper to validate if a team can be placed in a specific group ---
  const canPlaceTeamInGroup = useCallback((team: Country, group: Group) => {
    if (group.teams.length >= maxTeamsPerGroup) return false;

    if (potsData?.maxTwoUefaPerGroup) {
      const teamConfed = team.confederation;
      
      // Count how many teams in this group already have the SAME confederation as the drawn team
      const confedCountInGroup = group.teams.filter(t => t.confederation === teamConfed).length;

      // Apply limits
      if (teamConfed === 'UEFA') {
        if (confedCountInGroup >= 2) return false;
      } else {
        // AFC, OFC, CONMEBOL, CONCACAF, CAF
        if (confedCountInGroup >= 1) return false;
      }
    }

    return true;
  }, [maxTeamsPerGroup, potsData?.maxTwoUefaPerGroup]);

  // --- NEW: Helper to find the next available valid group ---
  const findValidGroupIndex = useCallback((team: Country, currentGroups: Group[]) => {
    const minTeamsCount = Math.min(...currentGroups.map((g) => g.teams.length));

    // First attempt: Try to place in a group currently sitting at the minimum size
    let targetIndex = currentGroups.findIndex(g => 
      g.teams.length === minTeamsCount && canPlaceTeamInGroup(team, g)
    );

    // Fallback: If all min-size groups reject the team due to constraints, 
    // find ANY group that can accept them without violating max capacity or UEFA limits
    if (targetIndex === -1) {
      targetIndex = currentGroups.findIndex(g => canPlaceTeamInGroup(team, g));
    }

    return targetIndex;
  }, [canPlaceTeamInGroup]);

  const drawNextTeam = useCallback(() => {
    if (!pots.length || isDrawComplete) return;

    const activePotIdx = currentPotIndex - 1;
    const activePot = pots[activePotIdx];
    if (!activePot || activePot.length === 0) return;

    const randomIdx = Math.floor(Math.random() * activePot.length);
    const selectedTeam = activePot[randomIdx];

    // Use the constraint-aware finder
    const targetGroupIndex = findValidGroupIndex(selectedTeam, groups);
    
    if (targetGroupIndex === -1) {
      // Edge case: Draw deadlock. (More details below)
      console.warn(`Deadlock: Cannot place ${selectedTeam.name} without violating constraints.`);
      return; 
    }

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

    if (updatedPot.length === 0 && currentPotIndex < totalPots) {
      setCurrentPotIndex((prev) => prev + 1);
    }
  }, [pots, groups, currentPotIndex, totalPots, isDrawComplete, findValidGroupIndex]);

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
        const randomIdx = Math.floor(Math.random() * activePot.length);
        const selectedTeam = activePot[randomIdx];

        // Use the constraint-aware finder
        const targetGroupIndex = findValidGroupIndex(selectedTeam, currentGroups);

        if (targetGroupIndex === -1) {
           console.warn(`Deadlock encountered during auto-draw for ${selectedTeam.name}`);
           break; // Hault auto-draw to prevent infinite loops if constraints are impossible
        }

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
  }, [pots, groups, currentPotIndex, totalPots, isDrawComplete, findValidGroupIndex]);

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