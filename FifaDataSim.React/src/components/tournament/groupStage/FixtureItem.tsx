
import { useEffect, useRef, useState, type ChangeEvent, type JSX } from "react";
import type { Fixture } from "../../../services/helpers/groupSimulationUtils";

type ResultType = 'shock' | 'trashing' | null;

export function FixtureItem({
  fixture,
  onScoreChange,
}: {
  fixture: Fixture;
  onScoreChange: (fixtureId: string, side: 'home' | 'away', value: string) => void;
}): JSX.Element {

  const isBye = !fixture.homeTeam || !fixture.awayTeam;

  // Result classification
  const getResultType = (): ResultType => {
    const { homeTeam, awayTeam, homeScore, awayScore } = fixture;

    if (
      !homeTeam ||
      !awayTeam ||
      homeScore === null ||
      awayScore === null
    ) {
      return null;
    }

    const homeWon = homeScore > awayScore;
    const isDraw = homeScore === awayScore;
    const margin = Math.abs(homeScore - awayScore);

    const winner = homeWon ? homeTeam : awayTeam;
    const loser = homeWon ? awayTeam : homeTeam;

    // Determine whether the result is a shock.
    const isShockMatch =
      homeTeam.default_points != null &&
      awayTeam.default_points != null &&
      (
        isDraw
          ? Math.min(homeTeam.default_points, awayTeam.default_points) <=
            Math.max(homeTeam.default_points, awayTeam.default_points) * 0.70
          : winner.default_points <= loser.default_points * 0.70
      );

    if (isShockMatch) return 'shock';

    // Trashing: winning margin of 5 or more.
    if (margin >= 5) return 'trashing';

    return null;
  };

  const resultType = getResultType();

  // Trigger a single flash when a result classification appears or changes.
  const [flash, setFlash] = useState(false);
  const previousResult = useRef<ResultType>(null);
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      previousResult.current = resultType;
      return;
    }

    if (resultType && resultType !== previousResult.current) {
      setFlash(true);

      const timer = window.setTimeout(() => {
        setFlash(false);
      }, 900);

      previousResult.current = resultType;

      return () => window.clearTimeout(timer);
    }

    if (!resultType) {
      setFlash(false);
    }

    previousResult.current = resultType;
  }, [resultType]);

  if (isBye) {
    const activeTeam = fixture.homeTeam || fixture.awayTeam;

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-[11px] text-gray-500 flex justify-between items-center">
        <span>
          Group <strong>{fixture.groupKey}</strong> (R{fixture.round})
        </span>

        <span className="font-medium text-gray-600 flex items-center gap-1.5 truncate">
          {activeTeam?.flag_url && (
            <img
              src={activeTeam.flag_url}
              alt={`${activeTeam.name} flag`}
              className="w-4 h-3 object-cover rounded-xs shrink-0 shadow-2xs"
            />
          )}
          <span className="truncate" title={activeTeam?.name}>
            {activeTeam?.name}
          </span>
          HAS A BYE
        </span>
      </div>
    );
  }

  // Dynamic result styling
  const resultStyles = {
    shock: 'border-purple-400 bg-purple-50 shadow-sm',
    trashing: 'border-red-400 bg-red-50 shadow-sm',
  };

  return (
    <div
      className={`
        border rounded-xl p-2 shadow-2xs flex items-center justify-between
        transition-colors duration-300
        ${
          resultType
            ? resultStyles[resultType]
            : fixture.isPlayed
              ? 'border-gray-200 bg-gray-50/30'
              : 'border-blue-200 bg-blue-50/10'
        }
        ${flash && resultType === 'shock' ? 'animate-shock-flash' : ''}
        ${flash && resultType === 'trashing' ? 'animate-trashing-flash' : ''}
      `}
    >

      {/* Home Team */}
      <div className="flex-1 flex items-center justify-end gap-1.5 text-right font-medium text-xs text-gray-800 pr-1 min-w-0 overflow-hidden">
        <span className="truncate" title={fixture.homeTeam?.name}>
          {fixture.homeTeam?.is_starred == true && (
            <span className="mr-0.5 text-xs" title="Starred Country">⭐</span>
          )}
          {fixture.homeTeam?.name}
        </span>

        {fixture.homeTeam?.flag_url && (
          <img
            src={fixture.homeTeam.flag_url}
            alt={`${fixture.homeTeam.name} flag`}
            className="w-4 h-3 object-cover rounded-xs shrink-0 shadow-2xs"
          />
        )}
      </div>

      {/* Score Inputs */}
      <div className="flex items-center gap-1 px-1 shrink-0">
        <input
          type="number"
          min={0}
          value={fixture.homeScore ?? ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onScoreChange(fixture.id, 'home', e.target.value)
          }
          className="w-7 h-7 text-center border border-gray-300 rounded-md text-xs font-bold focus:border-blue-500 focus:outline-none bg-white"
        />

        <span className="text-gray-300 font-bold text-xs">-</span>

        <input
          type="number"
          min={0}
          value={fixture.awayScore ?? ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onScoreChange(fixture.id, 'away', e.target.value)
          }
          className="w-7 h-7 text-center border border-gray-300 rounded-md text-xs font-bold focus:border-blue-500 focus:outline-none bg-white"
        />
      </div>

      {/* Away Team */}
      <div className="flex-1 flex items-center justify-start gap-1.5 text-left font-medium text-xs text-gray-800 pl-1 min-w-0 overflow-hidden">
        {fixture.awayTeam?.flag_url && (
          <img
            src={fixture.awayTeam.flag_url}
            alt={`${fixture.awayTeam.name} flag`}
            className="w-4 h-3 object-cover rounded-xs shrink-0 shadow-2xs"
          />
        )}

        <span className="truncate" title={fixture.awayTeam?.name}>
          {fixture.awayTeam?.name}
          {fixture.awayTeam?.is_starred == true && (
            <span className="ml-0.5 text-xs" title="Starred Country">⭐</span>
          )}
        </span>
      </div>

    </div>
  );
}
