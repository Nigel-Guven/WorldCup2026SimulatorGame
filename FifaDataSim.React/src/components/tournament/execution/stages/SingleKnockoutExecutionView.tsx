import { useState, type JSX } from 'react';
import { SingleKnockoutSimulationUtils } from '../../../../services/helpers/singleKnockoutSimulationUtils';
import type { Country } from '../../../../types/country';
import type { SingleKnockoutPhase } from '../../../../types/tournamentConfiguration';
import type { KnockoutMatchup } from '../../../../types/knockoutMatchup';
import { KnockoutSimulationEngine } from '../../../../services/knockoutSimulationService';
import { PathMatchCard } from '../../multiKnockoutStage/PathMatchCard';
import { updateTeamStats } from '../../../../services/teamService';
import type { MatchUpdateDto } from '../../../../types/matchUpdateDto';

interface SingleKnockoutExecutionViewProps {
  phase: SingleKnockoutPhase;
  initialMatchups: KnockoutMatchup[];
  onComplete: (data: {
    champion: Country;
    runnerUp: Country;
    thirdPlace?: Country;
    allMatches: KnockoutMatchup[];
  }) => void;
}

export function SingleKnockoutExecutionView({
  phase,
  initialMatchups,
  onComplete,
}: SingleKnockoutExecutionViewProps): JSX.Element {
  const legs = phase.config.number_of_legs || 1;

  // Helper to format initial matchups into the shape createInitialBracket expects
  const formatMatchups = (matchups: KnockoutMatchup[]) =>
    matchups.map((m) => ({
      matchId: Number(m.matchId || m.id) || 0,
      teamA: m.teamA as Country,
      teamB: m.teamB as Country,
    }));

  const [matches, setMatches] = useState<KnockoutMatchup[]>(() =>
    SingleKnockoutSimulationUtils.createInitialBracket(
      formatMatchups(initialMatchups),
      phase.config
    )
  );

  const finalMatch = matches.find((m) => m.roundName === 'Final');
  const thirdPlaceMatch = matches.find((m) => m.isThirdPlaceMatch);

  const isBracketComplete =
    finalMatch?.isPlayed && (!thirdPlaceMatch || thirdPlaceMatch.isPlayed);

  const getKnockoutImportance = (matchesInRound: number, isThirdPlace?: boolean) => {
    if (isThirdPlace) return 60.0;
    if (matchesInRound <= 4) return 60.0; // Quarter-Finals (4), Semi-Finals (2), Final (1)
    return 50.0; // Round of 16 (8), Round of 32 (16), etc.
  };

  const handlePlayMatch = async (matchId: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target || !target.teamA || !target.teamB || target.isPlayed) return;

    const simulated = KnockoutSimulationEngine.simulateKnockoutMatch(target, legs);

    const homeGoals = 
      (simulated.leg1ScoreA ?? 0) + 
      (simulated.leg2ScoreA ?? 0) + 
      (simulated.extraTimeScoreA ?? 0);

    const awayGoals = 
      (simulated.leg1ScoreB ?? 0) + 
      (simulated.leg2ScoreB ?? 0) + 
      (simulated.extraTimeScoreB ?? 0);

    const matchesInRound = matches.filter(m => m.roundIndex === target.roundIndex).length;
    const importance = getKnockoutImportance(matchesInRound, target.isThirdPlaceMatch);

    const matchUpdate: MatchUpdateDto = {
      homeTeamId: target.teamA.id,
      awayTeamId: target.teamB.id,
      homeTeamGoals: homeGoals,
      awayTeamGoals: awayGoals,
      importance: importance
    };

    try {
      await updateTeamStats(matchUpdate);

      setMatches((prev) => {
        const updatedList = prev.map((m) => (m.id === matchId ? simulated : m));
        return SingleKnockoutSimulationUtils.propagateWinners(updatedList);
      });
    } catch (error) {
      console.error('Failed to update knockout match stats on backend:', error);
    }
  };

  // Simulate all currently playable matches
  const handleSimulatePlayable = () => {
    setMatches((prev) => {
      let current = [...prev];
      let updatedAny = false;

      current.forEach((m) => {
        if (!m.isPlayed && m.teamA && m.teamB) {
          current = current.map((match) =>
            match.id === m.id
              ? KnockoutSimulationEngine.simulateKnockoutMatch(match, legs)
              : match
          );
          updatedAny = true;
        }
      });

      return updatedAny
        ? SingleKnockoutSimulationUtils.propagateWinners(current)
        : prev;
    });
  };

  // Simulate whole bracket to completion
  const handleSimulateAll = () => {
    setMatches((prev) => {
      let current = [...prev];
      let active = true;

      while (active) {
        let playableFound = false;
        for (let i = 0; i < current.length; i++) {
          const m = current[i];
          if (!m.isPlayed && m.teamA && m.teamB) {
            current[i] = KnockoutSimulationEngine.simulateKnockoutMatch(m, legs);
            current = SingleKnockoutSimulationUtils.propagateWinners(current);
            playableFound = true;
            break;
          }
        }
        if (!playableFound) active = false;
      }

      return current;
    });
  };

  const handleReset = () => {
    setMatches(
      SingleKnockoutSimulationUtils.createInitialBracket(
        formatMatchups(initialMatchups),
        phase.config
      )
    );
  };

  const handleFinish = () => {
    if (!finalMatch?.winner || !finalMatch?.loser) return;
    onComplete({
      champion: finalMatch.winner,
      runnerUp: finalMatch.loser,
      thirdPlace: thirdPlaceMatch?.winner || undefined,
      allMatches: matches,
    });
  };

  const rounds = Array.from(
    new Set(matches.filter((m) => !m.isThirdPlaceMatch).map((m) => m.roundIndex))
  ).sort((a, b) => a - b);

  // Split rounds into Left and Right sides (Excluding the Final, which is the last round)
  const earlyRounds = rounds.slice(0, -1);

  // First half of matches go to the left bracket
  const leftColumns = earlyRounds.map((roundIdx) => {
    const roundMatches = matches.filter((m) => m.roundIndex === roundIdx && !m.isThirdPlaceMatch);
    const half = Math.ceil(roundMatches.length / 2);
    return {
      roundIdx,
      name: roundMatches[0]?.roundName || `Round ${roundIdx + 1}`,
      matches: roundMatches.slice(0, half),
    };
  });

  // Second half of matches go to the right bracket (Ordered backwards to flow right-to-left)
  const rightColumns = [...earlyRounds].reverse().map((roundIdx) => {
    const roundMatches = matches.filter((m) => m.roundIndex === roundIdx && !m.isThirdPlaceMatch);
    const half = Math.ceil(roundMatches.length / 2);
    return {
      roundIdx,
      name: roundMatches[0]?.roundName || `Round ${roundIdx + 1}`,
      matches: roundMatches.slice(half),
    };
  });

  return (
    <div className="space-y-8">
      {/* Simulation Control Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Knockout Bracket Simulation</h3>
          <p className="text-xs text-gray-500 mt-1">
            Format: <strong className="text-blue-600">{legs} Leg{legs > 1 ? 's' : ''}</strong>
            {thirdPlaceMatch ? ' • Includes 3rd Place Match' : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSimulatePlayable}
            disabled={isBracketComplete}
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 rounded-xl font-semibold text-xs transition-all"
          >
            ⚡ Play Available Matches
          </button>
          <button
            type="button"
            onClick={handleSimulateAll}
            disabled={isBracketComplete}
            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 rounded-xl font-semibold text-xs shadow-sm transition-all"
          >
            🚀 Simulate Bracket
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold text-xs transition-all"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={!isBracketComplete}
            className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 rounded-xl font-bold text-xs shadow-md transition-all"
          >
            Confirm & Complete Phase
          </button>
        </div>
      </div>

      {/* Center-Focused Bracket Tree */}
      <div className="overflow-x-auto pb-8 w-full custom-scrollbar">
        {/* items-stretch ensures all columns match the height of the tallest column, 
            allowing justify-around to vertically center matches exactly between their feeders */}
        <div className="flex items-stretch justify-center gap-8 min-w-max mx-auto px-6 pt-4">
          
          {/* LEFT WING */}
          {leftColumns.map((col) => (
            <div key={`left-${col.roundIdx}`} className="flex flex-col w-[320px]">
              <h4 className="font-bold text-xs text-center text-gray-500 uppercase tracking-wider bg-gray-100 py-1.5 rounded-lg mb-4 shrink-0">
                {col.name}
              </h4>
              <div className="flex flex-col justify-around flex-1 gap-6">
                {col.matches.map((m) => (
                  <PathMatchCard
                    key={m.id}
                    match={m}
                    legs={legs}
                    onPlay={() => handlePlayMatch(m.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* CENTER WING (Final & 3rd Place) */}
          <div className="flex flex-col w-[360px] mx-2">
            <div className="flex flex-col justify-center flex-1 gap-12 relative">
              
              {finalMatch && (
                <div className="flex flex-col bg-amber-50/20 border border-amber-200/60 p-3 rounded-2xl shadow-sm relative">
                  <h4 className="font-bold text-sm text-center text-amber-700 uppercase tracking-wider bg-amber-100/70 py-2 rounded-xl mb-4 shrink-0">
                    🏆 Grand Final
                  </h4>
                  <PathMatchCard
                    match={finalMatch}
                    legs={legs}
                    onPlay={() => handlePlayMatch(finalMatch.id)}
                  />
                </div>
              )}

              {thirdPlaceMatch && (
                <div className="flex flex-col bg-slate-50 border border-slate-200 p-3 rounded-2xl shadow-sm relative">
                  <h4 className="font-bold text-xs text-center text-slate-600 uppercase tracking-wider bg-slate-200 py-1.5 rounded-lg mb-3 shrink-0">
                    🥉 Third Place
                  </h4>
                  <PathMatchCard
                    match={thirdPlaceMatch}
                    legs={legs}
                    onPlay={() => handlePlayMatch(thirdPlaceMatch.id)}
                    // @ts-ignore - Ensure prop exists if your card expects it for styling
                    isThirdPlace={true} 
                  />
                </div>
              )}
              
            </div>
          </div>

          {/* RIGHT WING */}
          {rightColumns.map((col) => (
            <div key={`right-${col.roundIdx}`} className="flex flex-col w-[320px]">
              <h4 className="font-bold text-xs text-center text-gray-500 uppercase tracking-wider bg-gray-100 py-1.5 rounded-lg mb-4 shrink-0">
                {col.name}
              </h4>
              <div className="flex flex-col justify-around flex-1 gap-6">
                {col.matches.map((m) => (
                  <PathMatchCard
                    key={m.id}
                    match={m}
                    legs={legs}
                    onPlay={() => handlePlayMatch(m.id)}
                  />
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}