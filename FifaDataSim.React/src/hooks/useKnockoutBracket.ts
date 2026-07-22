import { useState, useEffect, useCallback } from 'react';
import type { KnockoutBracket } from '../types/KnockoutBracket';
import { knockoutService } from '../services/knockoutService';

export type BracketTab = 'ALL' | 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL';

export function useKnockoutBracket() {
  const [bracket, setBracket] = useState<KnockoutBracket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BracketTab>('ALL');

  const fetchBracket = useCallback(async () => {
    try {
      setError(null);
      const data = await knockoutService.generateBracket();
      setBracket(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bracket');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBracket();
  }, [fetchBracket]);

  const simulateMatch = useCallback(async (matchId: string) => {
    try {
      setError(null);
      const updatedBracket = await knockoutService.simulateMatch(matchId);
      setBracket(updatedBracket);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    }
  }, []);

  return {
    bracket,
    loading,
    error,
    activeTab,
    setActiveTab,
    simulateMatch,
  };
}