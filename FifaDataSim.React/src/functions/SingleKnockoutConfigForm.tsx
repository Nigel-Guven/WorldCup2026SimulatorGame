import type { FormProps } from "../types/formProps";
import type { Phase } from "../types/phase";
import type { SingleKnockoutPhase } from "../types/tournamentConfiguration";

export function SingleKnockoutConfigForm({ config, targetPhases, onChange }: FormProps<SingleKnockoutPhase['config']>) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Third Place Match</label>
          <select
            value={config.third_place_match ? 'true' : 'false'}
            onChange={(e) => onChange('third_place_match', e.target.value === 'true')}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="true">Yes (3rd Place Match)</option>
            <option value="false">No</option>
          </select>
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
            <option value="">-- Next Phase / None --</option>
            {targetPhases.map((p: Phase) => (
              <option key={p.id} value={p.name}>
                {p.name} ({p.tag})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Losers Route To</label>
          <select
            value={config.losers_to_phase_tag ?? ''}
            onChange={(e) => onChange('losers_to_phase_tag', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="">-- None (Eliminated) --</option>
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