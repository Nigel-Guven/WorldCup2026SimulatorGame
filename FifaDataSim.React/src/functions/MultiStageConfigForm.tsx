import type { FormProps } from "../types/formProps";
import type { MultiKnockoutPhase } from "../types/tournamentConfiguration";

export function MultiKnockoutConfigForm({ config, targetPhases, onChange }: FormProps<MultiKnockoutPhase['config']>) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Number Of Paths</label>
          <input
            type="number"
            min={1}
            value={config.number_of_paths}
            onChange={(e) => onChange('number_of_paths', Number(e.target.value))}
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
            {targetPhases.map((p) => (
              <option key={p.id} value={p.tag}>
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
            {targetPhases.map((p) => (
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