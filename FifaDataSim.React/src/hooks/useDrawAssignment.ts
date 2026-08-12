import { useState, useMemo, useCallback } from 'react';

export interface UseDrawAssignmentOptions<TCountry, TState, TResult> {
  totalTeams: number;
  initialState: TState;
  getAssignedIds: (state: TState) => Set<string | number>;
  assignSingleTeam?: (currentState: TState, team: TCountry) => TState;
  autoDrawAll?: () => TState;
  buildResult: (state: TState) => TResult;
}

export function useDrawAssignment<
  TCountry extends { id?: string | number },
  TState,
  TResult,
>({
  totalTeams,
  initialState,
  getAssignedIds,
  assignSingleTeam,
  autoDrawAll,
  buildResult,
}: UseDrawAssignmentOptions<TCountry, TState, TResult>) {
  const [drawState, setDrawState] = useState<TState>(initialState);
  const [selectedTeam, setSelectedTeam] = useState<TCountry | null>(null);

  const rawAssignedTeamIds = useMemo(
    () => getAssignedIds(drawState),
    [drawState, getAssignedIds]
  );

  const assignedTeamIds = useMemo(() => {
    const normalized = new Set<string>();
    rawAssignedTeamIds.forEach((id) => {
      if (id !== undefined && id !== null) {
        normalized.add(String(id));
      }
    });
    return normalized;
  }, [rawAssignedTeamIds]);

  const isComplete = assignedTeamIds.size >= totalTeams;

  const selectTeam = useCallback((team: TCountry | null) => {
    if (!team) {
      setSelectedTeam(null);
      return;
    }
    setSelectedTeam((prev) => (prev?.id === team.id ? null : team));
  }, []);

  const handleAssignSingle = useCallback(
    (team: TCountry) => {
      if (assignSingleTeam) {
        setDrawState((prev) => assignSingleTeam(prev, team));
        setSelectedTeam(null);
      }
    },
    [assignSingleTeam]
  );

  const handleDrawNextAvailable = useCallback(
    (pots: { teams: TCountry[] }[]) => {
      // Recalculate directly from current state inside callback logic
      const currentAssignedIds = getAssignedIds(drawState);
      const normalizedIds = new Set<string>();
      currentAssignedIds.forEach((id) => id != null && normalizedIds.add(String(id)));

      const activePot = pots.find((pot) =>
        pot.teams.some(
          (t) => t.id !== undefined && !normalizedIds.has(String(t.id))
        )
      );

      if (!activePot) return;

      const availableInPot = activePot.teams.filter(
        (t) => t.id !== undefined && !normalizedIds.has(String(t.id))
      );

      if (availableInPot.length === 0) return;

      const randomIndex = Math.floor(Math.random() * availableInPot.length);
      const nextTeam = availableInPot[randomIndex];

      handleAssignSingle(nextTeam);
    },
    [drawState, getAssignedIds, handleAssignSingle]
  );
  
  const handleAutoDrawAll = useCallback(() => {
    if (autoDrawAll) {
      setDrawState(autoDrawAll());
      setSelectedTeam(null);
    }
  }, [autoDrawAll]);

  const handleReset = useCallback(() => {
    setDrawState(initialState);
    setSelectedTeam(null);
  }, [initialState]);

  const getResult = useCallback(() => buildResult(drawState), [buildResult, drawState]);

  return {
    drawState,
    setDrawState,
    selectedTeam,
    setSelectedTeam,
    assignedTeamIds,
    isComplete,
    selectTeam,
    handleAssignSingle,
    handleDrawNextAvailable,
    handleAutoDrawAll,
    handleReset,
    getResult,
  };
}