import type { JSX } from 'react';
import type { Confederation } from '../../../types/confederation';
import type { Country } from '../../../types/country';
import { CONFEDERATIONS } from '../../../types/confederationConfiguration';
import { ConfederationBox } from './ConfederationBox';

interface AvailableTeamsPanelProps {
  teamsData: Record<Confederation, Country[]>;
  loadingStates: Record<Confederation, boolean>;
  errorStates: Record<Confederation, string | null>;
  assignedTeamIds: Set<string | number>;
  onReload: (confederation: Confederation) => Promise<void>;
}

export function AvailableTeamsPanel({
  teamsData,
  loadingStates,
  errorStates,
  assignedTeamIds,
  onReload,
}: AvailableTeamsPanelProps): JSX.Element {
  return (
    <div className="w-full lg:w-1/2 xl:w-7/12">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Available Teams
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONFEDERATIONS.map((conf) => {
          const allConfTeams = teamsData[conf.id] || [];

          const availableTeams = allConfTeams.filter(
            (team) =>
              team.id !== undefined &&
              !assignedTeamIds.has(team.id)
          );

          return (
            <ConfederationBox
              key={conf.id}
              conf={conf}
              teams={availableTeams}
              isLoading={loadingStates[conf.id]}
              error={errorStates[conf.id]}
              onReload={onReload}
            />
          );
        })}
      </div>
    </div>
  );
}