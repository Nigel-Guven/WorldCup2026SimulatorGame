import type { FormProps } from "../types/formProps";
import type { Phase } from "../types/phase";
import type { GroupStagePhase } from "../types/tournamentConfiguration";

export function GroupStageConfigForm({ config, targetPhases, onChange }: FormProps<GroupStagePhase['config']>) {
  return (
    <div className="space-y-3">
      {/* Basic Group Setup */}
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
            value={config.group_size ?? 4}
            onChange={(e) => onChange('group_size', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>
      </div>

      {/* Advancement & Relegation Counts */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Direct Advancers / Group</label>
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

      {/* Wildcards (Optional) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Wildcard Position</label>
          <input
            type="number"
            min={1}
            value={config.wildcard_position ?? ''}
            onChange={(e) => onChange('wildcard_position', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
            placeholder="e.g. 3 (Best 3rd place)"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Wildcard Teams Count</label>
          <input
            type="number"
            min={1}
            value={config.wildcard_teams_count ?? ''}
            onChange={(e) => onChange('wildcard_teams_count', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
            placeholder="e.g. 4"
          />
        </div>
      </div>

      {/* Routing Target Phase Tags */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Winners Route To</label>
          <select
            value={config.winners_to_phase_tag ?? ''}
            onChange={(e) => onChange('winners_to_phase_tag', e.target.value || undefined)}
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
          <label className="block text-gray-600 font-medium mb-1">Wildcards Route To</label>
          <select
            value={config.wildcards_to_phase_tag ?? ''}
            onChange={(e) => onChange('wildcards_to_phase_tag', e.target.value || undefined)}
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
          <label className="block text-gray-600 font-medium mb-1">Relegated Route To</label>
          <select
            value={config.relegated_to_phase_tag ?? ''}
            onChange={(e) => onChange('relegated_to_phase_tag', e.target.value || undefined)}
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