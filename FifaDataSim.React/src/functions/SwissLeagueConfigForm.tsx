import type { FormProps } from "../types/formProps";
import type { Phase } from "../types/phase";
import type { SwissLeaguePhase } from "../types/tournamentConfiguration";

// Validate Swiss League configuration
function isValidSwissLeague(
  numberOfTeams: number,
  matchesPerTeam: number
): boolean {
  return (
    Number.isInteger(numberOfTeams) &&
    Number.isInteger(matchesPerTeam) &&
    numberOfTeams >= 2 &&
    matchesPerTeam >= 1 &&
    matchesPerTeam <= numberOfTeams - 1 &&
    (numberOfTeams * matchesPerTeam) % 2 === 0
  );
}

export function SwissLeagueConfigForm({
  config,
  targetPhases,
  teams,
  onChange
}: FormProps<SwissLeaguePhase['config']>) {

  // Swiss League validation
  const numberOfTeams = teams?.length ?? 0;
  const matchesPerTeam = config.number_of_matches_per_team ?? 4;

  const isValid = isValidSwissLeague(
    numberOfTeams,
    matchesPerTeam
  );

  const totalMatches = (numberOfTeams * matchesPerTeam) * config.number_of_legs;

  return (
    <div className="space-y-3">

      {/* Basic Setup */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Number of Matches per Team
          </label>
          <input
            type="number"
            min={1}
            value={config.number_of_matches_per_team ?? 4}
            onChange={(e) =>
              onChange('number_of_matches_per_team', Number(e.target.value))
            }
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Match Importance
          </label>
          <select
            value={config.match_importance ?? 5}
            onChange={(e) =>
              onChange('match_importance', Number(e.target.value))
            }
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value={5}>International Friendlies (5)</option>
            <option value={15}>Nations League (15)</option>
            <option value={25}>WC/Regional Qualifiers (25)</option>
            <option value={30}>Confederation Playoffs (30)</option>
            <option value={35}>WC/Regional Group Stage (35)</option>
          </select>
        </div>
      </div>

      {/* Swiss League Validation */}
      <div
        className={`text-sm font-medium px-3 py-2 rounded ${
          isValid
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {isValid ? (
          <>
            <span>✓ Valid Swiss League Configuration</span>
            <span className="ml-2 font-normal">
              ({totalMatches} total matches)
            </span>
          </>
        ) : (
          <>
            <span>✗ Invalid Swiss League Configuration</span>
            <span className="ml-2 font-normal">
              {numberOfTeams < 2
                ? 'At least 2 teams are required.'
                : matchesPerTeam < 1
                  ? 'At least 1 match per team is required.'
                  : matchesPerTeam > numberOfTeams - 1
                    ? 'Matches per team cannot exceed the number of opponents.'
                    : 'Total team appearances must be divisible by 2.'}
            </span>
          </>
        )}
      </div>

      {/* Advancement & Playoff Teams */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Direct Advancers
          </label>
          <input
            type="number"
            min={1}
            value={config.direct_advance_count}
            onChange={(e) =>
              onChange('direct_advance_count', Number(e.target.value))
            }
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Playoff Start Position
          </label>
          <input
            type="number"
            min={1}
            value={config.playoff_position_start ?? ''}
            onChange={(e) =>
              onChange(
                'playoff_position_start',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
            placeholder="e.g. 9 (9th place)"
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Playoff Teams Count
          </label>
          <input
            type="number"
            min={0}
            value={config.playoff_teams_count ?? ''}
            onChange={(e) =>
              onChange(
                'playoff_teams_count',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
            placeholder="e.g. 16 (9th to 24th)"
          />
        </div>
      </div>

      {/* Routing Target Phase Tags */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Winners Route To
          </label>
          <select
            value={config.winners_to_phase_tag ?? ''}
            onChange={(e) =>
              onChange('winners_to_phase_tag', e.target.value || undefined)
            }
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="">-- None --</option>
            {targetPhases.map((p: Phase) => (
              <option key={p.id} value={p.tag}>
                {p.name} ({p.tag})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Wildcards Route To
          </label>
          <select
            value={config.wildcards_to_phase_tag ?? ''}
            onChange={(e) =>
              onChange('wildcards_to_phase_tag', e.target.value || undefined)
            }
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="">-- None --</option>
            {targetPhases.map((p: Phase) => (
              <option key={p.id} value={p.tag}>
                {p.name} ({p.tag})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Relegated Route To
          </label>
          <select
            value={config.relegated_to_phase_tag ?? ''}
            onChange={(e) =>
              onChange('relegated_to_phase_tag', e.target.value || undefined)
            }
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="">-- None --</option>
            {targetPhases.map((p: Phase) => (
              <option key={p.id} value={p.tag}>
                {p.name} ({p.tag})
              </option>
            ))}
          </select>
        </div>
      </div>

    </div>
  );
}