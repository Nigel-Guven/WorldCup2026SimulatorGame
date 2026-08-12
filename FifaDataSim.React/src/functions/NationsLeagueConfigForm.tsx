import type { FormProps } from "../types/formProps";
import type { Phase } from "../types/phase";
import type { NationsLeaguePhase } from "../types/tournamentConfiguration";

export function NationsLeagueConfigForm({ config, targetPhases, onChange }: FormProps<NationsLeaguePhase['config']>) {
  return (
    <div className="space-y-3">
      {/* Group & Format Setup */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Number of Groups</label>
          <input
            type="number"
            min={1}
            value={config.number_of_groups}
            onChange={(e) => onChange('number_of_groups', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Group Size</label>
          <input
            type="number"
            min={1}
            value={config.group_size}
            onChange={(e) => onChange('group_size', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Number of Legs</label>
          <select
            value={config.number_of_legs}
            onChange={(e) => onChange('number_of_legs', Number(e.target.value) as 1 | 2)}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value={1}>Single Leg (1)</option>
            <option value={2}>Home & Away (2)</option>
          </select>
        </div>
      </div>

      {/* Promotion, Playoff & Relegation Positions */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Direct Advancers per Group</label>
          <input
            type="number"
            min={1}
            value={config.direct_advance_per_group}
            onChange={(e) => onChange('direct_advance_per_group', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Playoff Qualifiers / Group</label>
          <input
            type="number"
            min={0}
            value={config.playoff_qualifiers_per_group ?? 0}
            onChange={(e) => onChange('playoff_qualifiers_per_group', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Relegated per Group</label>
          <input
            type="number"
            min={0}
            value={config.relegated_per_group ?? 0}
            onChange={(e) => onChange('relegated_per_group', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>
      </div>

      {/* Target Routing Setup */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Winners / Promoted Route To</label>
          <select
            value={config.winners_to_phase_tag ?? ''}
            onChange={(e) => onChange('winners_to_phase_tag', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="">-- Select Target Phase Tag --</option>
            {targetPhases.map((p: Phase) => (
              <option key={p.id} value={p.tag}>
                {p.name} ({p.tag})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Relegated / Playoff Route To</label>
          <select
            value={config.relegated_to_phase_tag ?? ''}
            onChange={(e) => onChange('relegated_to_phase_tag', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="">-- Select Target Phase Tag --</option>
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