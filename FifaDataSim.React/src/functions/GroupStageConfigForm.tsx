import type { FormProps } from "../types/formProps";
import type { Phase } from "../types/phase";
import type { GroupStagePhase } from "../types/tournamentConfig";

export function GroupStageConfigForm({ config, targetPhases, onChange }: FormProps<GroupStagePhase['config']>) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
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
      </div>

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
          <label className="block text-gray-600 font-medium mb-1">Wildcard Position per Group</label>
          <input
            type="number"
            min={1}
            value={config.wildcard_position}
            onChange={(e) => onChange('wildcard_position', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Wildcard Teams Count</label>
          <input
            type="number"
            min={1}
            value={config.wildcard_teams_count}
            onChange={(e) => onChange('wildcard_teams_count', Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Winners Route To</label>
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
          <label className="block text-gray-600 font-medium mb-1">Wildcards Route To</label>
          <select
            value={config.wildcards_to_phase_tag ?? ''}
            onChange={(e) => onChange('wildcards_to_phase_tag', e.target.value || undefined)}
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