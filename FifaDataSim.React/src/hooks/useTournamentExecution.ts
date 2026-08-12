import { useState, useMemo } from "react";
import type { Phase } from "../types/phase";
import type { DrawResult } from "../types/drawResult";
import type { PhaseCompletionData } from "../types/phaseCompletionData";

export type ExecutionStage = "IDLE" | "DRAW" | "SIMULATION" | "COMPLETED";

export interface TournamentExecutionState {
  isExecuting: boolean;
  activePhase: Phase | null;
  currentPhaseIndex: number;
  stage: ExecutionStage;
  drawResult: DrawResult | null;
  isPhaseCompleted: boolean;
  completionData: PhaseCompletionData | null;
  
  beginTournament: () => void;
  nextPhase: () => void;
  exitExecution: () => void;
  completeDraw: (result: DrawResult) => void;
  completeSimulation: (data: PhaseCompletionData) => void;
}

export function useTournamentExecution(phases: Phase[]): TournamentExecutionState {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [stage, setStage] = useState<ExecutionStage>("IDLE");
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [isPhaseCompleted, setIsPhaseCompleted] = useState<boolean>(false);
  const [completionData, setCompletionData] = useState<PhaseCompletionData | null>(null);

  const activePhase = useMemo(() => {
    return phases[currentPhaseIndex] ?? null;
  }, [phases, currentPhaseIndex]);

  const beginTournament = () => {
    setCurrentPhaseIndex(0);
    setIsExecuting(true);
    setStage("DRAW");
    setDrawResult(null);
    setIsPhaseCompleted(false);
    setCompletionData(null);
  };

  const nextPhase = () => {
    if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhaseIndex((prev) => prev + 1);
      setStage("DRAW");
      setDrawResult(null);
      setIsPhaseCompleted(false);
      setCompletionData(null);
    } else {
      setStage("COMPLETED");
    }
  };

  const exitExecution = () => {
    setIsExecuting(false);
    setStage("IDLE");
    setCurrentPhaseIndex(0);
    setDrawResult(null);
    setIsPhaseCompleted(false);
    setCompletionData(null);
  };

  const completeDraw = (result: DrawResult) => {
    setDrawResult(result);
    setStage("SIMULATION");
  };

  const completeSimulation = (data: PhaseCompletionData) => {
    setCompletionData(data);
    setIsPhaseCompleted(true);
  };

  return {
    isExecuting,
    activePhase,
    currentPhaseIndex,
    stage,
    drawResult,
    isPhaseCompleted,
    completionData,
    beginTournament,
    nextPhase,
    exitExecution,
    completeDraw,
    completeSimulation,
  };
}