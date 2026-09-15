import { useState, type JSX } from 'react';
import { SingleKnockoutSimulationUtils } from '../../../../services/helpers/singleKnockoutSimulationUtils';
import type { Country } from '../../../../types/country';
import type { SingleKnockoutPhase } from '../../../../types/tournamentConfiguration';
import type { KnockoutMatchup } from '../../../../types/knockoutMatchup';
import { SimulationEngine } from '../../../../services/simulationService';

interface SingleKnockoutExecutionViewProps {
  phase: SingleKnockoutPhase;
  initialMatchups: KnockoutMatchup[];
  onComplete: (data: {
    champion: Country;
    runnerUp: Country;
    thirdPlace?: Country;
    allMatches: KnockoutMatchup[]; // Added allMatches property
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

  // Play a single target match
  const handlePlayMatch = (matchId: string) => {
    setMatches((prev) => {
      const target = prev.find((m) => m.id === matchId);
      if (!target || !target.teamA || !target.teamB || target.isPlayed) return prev;

      const simulated = SimulationEngine.simulateKnockoutMatch(target, legs);
      const updatedList = prev.map((m) => (m.id === matchId ? simulated : m));

      return SingleKnockoutSimulationUtils.propagateWinners(updatedList);
    });
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
              ? SimulationEngine.simulateKnockoutMatch(match, legs)
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
            current[i] = SimulationEngine.simulateKnockoutMatch(m, legs);
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

  // Group bracket matches by round index for rendering columns
  const rounds = Array.from(
    new Set(matches.filter((m) => !m.isThirdPlaceMatch).map((m) => m.roundIndex))
  ).sort((a, b) => a - b);

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

      {/* Bracket Tree Columns */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-8 min-w-[800px]">
          {rounds.map((roundIdx) => {
            const roundMatches = matches.filter(
              (m) => m.roundIndex === roundIdx && !m.isThirdPlaceMatch
            );
            const roundName = roundMatches[0]?.roundName || `Round ${roundIdx + 1}`;

            return (
              <div key={roundIdx} className="flex-1 flex flex-col space-y-4">
                <h4 className="font-bold text-xs text-center text-gray-500 uppercase tracking-wider bg-gray-100 py-1.5 rounded-lg">
                  {roundName}
                </h4>

                <div className="flex flex-col justify-around flex-1 space-y-6">
                  {roundMatches.map((m) => (
                    <KnockoutMatchCard
                      key={m.id}
                      match={m}
                      legs={legs}
                      onPlay={() => handlePlayMatch(m.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* 3rd Place Match Sidebar Column */}
          {thirdPlaceMatch && (
            <div className="w-64 flex flex-col space-y-4">
              <h4 className="font-bold text-xs text-center text-amber-700 uppercase tracking-wider bg-amber-100 py-1.5 rounded-lg">
                Bronze Medal
              </h4>
              <KnockoutMatchCard
                match={thirdPlaceMatch}
                legs={legs}
                onPlay={() => handlePlayMatch(thirdPlaceMatch.id)}
                isThirdPlace
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KnockoutMatchCard({
  match,
  legs,
  onPlay,
  isThirdPlace = false,
}: {
  match: KnockoutMatchup;
  legs: number;
  onPlay: () => void;
  isThirdPlace?: boolean;
}) {
  const isPlayable = !match.isPlayed && match.teamA !== null && match.teamB !== null;

  return (
    <div
      className={`border rounded-xl p-3 bg-white shadow-sm transition-all ${
        isThirdPlace ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'
      }`}
    >
      <div className="space-y-2">
        {/* Team A Slot */}
        <TeamSlotRow
          team={match.teamA}
          isWinner={match.winner?.id === match.teamA?.id && match.isPlayed}
          leg1Score={match.leg1ScoreA}
          leg2Score={match.leg2ScoreA}
          penalties={match.penaltiesA}
          legs={legs}
        />

        <div className="border-t border-gray-100 my-1" />

        {/* Team B Slot */}
        <TeamSlotRow
          team={match.teamB}
          isWinner={match.winner?.id === match.teamB?.id && match.isPlayed}
          leg1Score={match.leg1ScoreB}
          leg2Score={match.leg2ScoreB}
          penalties={match.penaltiesB}
          legs={legs}
        />
      </div>

      {isPlayable && (
        <button
          type="button"
          onClick={onPlay}
          className="mt-3 w-full py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded-lg transition-all"
        >
          Play Match
        </button>
      )}
    </div>
  );
}

function TeamSlotRow({
  team,
  isWinner,
  leg1Score,
  leg2Score,
  penalties,
  legs,
}: {
  team: Country | null;
  isWinner: boolean;
  leg1Score?: number | null; 
  leg2Score?: number | null; 
  penalties?: number | null;
  legs: number;
}) {
  return (
    <div className={`flex justify-between items-center text-xs ${isWinner ? 'font-bold text-blue-950' : 'text-gray-600'}`}>
      <span className="truncate max-w-[110px]">{team ? team.name : 'TBD'}</span>

      <div className="flex items-center gap-1 text-[11px]">
        {leg1Score !== undefined && leg1Score !== null && (
          <span className="w-4 text-center">{leg1Score}</span>
        )}
        {legs === 2 && leg2Score !== undefined && leg2Score !== null && (
          <span className="w-4 text-center text-gray-400">({leg2Score})</span>
        )}
        {penalties !== undefined && penalties !== null && (
          <span className="text-[10px] text-amber-600 font-bold ml-1">p{penalties}</span>
        )}
      </div>
    </div>
  );
}