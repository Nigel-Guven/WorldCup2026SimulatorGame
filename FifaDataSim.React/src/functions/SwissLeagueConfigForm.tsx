import type { FormProps } from "../types/formProps";
import type { Phase } from "../types/phase";
import type { SwissLeaguePhase } from "../types/tournamentConfiguration";

function isValidSwissLeague(numberOfTeams: number, matchesPerTeam: number): boolean {
  return (
    Number.isInteger(numberOfTeams) &&
    Number.isInteger(matchesPerTeam) &&
    numberOfTeams >= 2 &&
    numberOfTeams % 2 === 0 &&
    matchesPerTeam >= 1 &&
    matchesPerTeam <= numberOfTeams - 1 &&
    (numberOfTeams * matchesPerTeam) % 2 === 0
  );
}

function getSwissLeagueValidationError(numberOfTeams: number, matchesPerTeam: number): string {
  if (numberOfTeams < 2) return 'At least 2 teams are required.';
  if (matchesPerTeam < 1) return 'At least 1 match per team is required.';
  if (matchesPerTeam > numberOfTeams - 1) return 'Matches per team cannot exceed the number of opponents.';
  return 'Total team appearances must be divisible by 2.';
}

interface PhaseSelectProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  targetPhases: Phase[];
}

function PhaseSelect({ label, value, onChange, targetPhases }: PhaseSelectProps) {
  return (
    <div>
      <label className="block text-gray-600 font-medium mb-1">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
      >
        <option value="">-- None --</option>
        {targetPhases.map((p) => (
          <option key={p.id} value={p.tag}>
            {p.name} ({p.tag})
          </option>
        ))}
      </select>
    </div>
  );
}

export function SwissLeagueConfigForm({
  config,
  targetPhases,
  onChange,
}: FormProps<SwissLeaguePhase['config']>) {
  const matchesPerTeam = config.number_of_matches_per_team ?? 4;
  const numberOfTeams = config.teams?.length ?? 0;
  const numberOfLegs = config.number_of_legs ?? 1;

  const isValid = isValidSwissLeague(numberOfTeams, matchesPerTeam);
  const totalMatches = numberOfTeams * matchesPerTeam * numberOfLegs;

  const routingFields = [
    { label: 'Winners Route To', key: 'winners_to_phase_tag' as const, value: config.winners_to_phase_tag },
    { label: 'Wildcards Route To', key: 'wildcards_to_phase_tag' as const, value: config.wildcards_to_phase_tag },
    { label: 'Relegated Route To', key: 'relegated_to_phase_tag' as const, value: config.relegated_to_phase_tag },
  ];

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
            value={matchesPerTeam}
            onChange={(e) => onChange('number_of_matches_per_team', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">
            Match Importance
          </label>
          <select
            value={config.match_importance ?? 5}
            onChange={(e) => onChange('match_importance', Number(e.target.value))}
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

      {/* Swiss League Validation Banner */}
      <div
        className={`text-sm font-medium px-3 py-2 rounded ${
          isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {isValid ? (
          <>
            <span>✓ Valid Swiss League Configuration</span>
            <span className="ml-2 font-normal">({totalMatches} total matches)</span>
          </>
        ) : (
          <>
            <span>✗ Invalid Swiss League Configuration</span>
            <span className="ml-2 font-normal">
              {getSwissLeagueValidationError(numberOfTeams, matchesPerTeam)}
            </span>
          </>
        )}
      </div>

      {/* Advancement & Playoff Teams */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Direct Advancers</label>
          <input
            type="number"
            min={1}
            value={config.direct_advance_count}
            onChange={(e) => onChange('direct_advance_count', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">Playoff Start Position</label>
          <input
            type="number"
            min={1}
            value={config.playoff_position_start ?? ''}
            onChange={(e) =>
              onChange('playoff_position_start', e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
            placeholder="e.g. 9 (9th place)"
          />
        </div>

        <div>
          <label className="block text-gray-600 font-medium mb-1">Playoff Teams Count</label>
          <input
            type="number"
            min={0}
            value={config.playoff_teams_count ?? ''}
            onChange={(e) =>
              onChange('playoff_teams_count', e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
            placeholder="e.g. 16 (9th to 24th)"
          />
        </div>
      </div>

      {/* Routing Target Phase Tags */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        {routingFields.map((field) => (
          <PhaseSelect
            key={field.key}
            label={field.label}
            value={field.value}
            onChange={(val) => onChange(field.key, val)}
            targetPhases={targetPhases}
          />
        ))}
      </div>
    </div>
  );
}