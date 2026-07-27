import type { GroupState } from '../types/groupState';
import type { MatchFixture } from '../types/matchFixture';
import type { TournamentSession } from '../types/tournamentSession';

import { useMatchCentre } from '../hooks/useMatchCentre';
import { GroupStageCompletionBanner } from '../components/matchCentre/GroupStageCompletionBanner';
import { MatchdayTabs } from '../components/matchCentre/MatchdayTabs';
import { FixtureCard } from '../components/matchCentre/FixtureCard';
import { GroupStandingsTable } from '../components/matchCentre/GroupStandingTable';
import { ThirdPlaceStandingsTable } from '../components/matchCentre/ThirdPlaceStandingsTable';

interface MatchCentreProps {
  session: TournamentSession;
  onSessionUpdate: (updatedSession: TournamentSession) => void;
  onNavigateToKnockout: () => void;
}

export default function MatchCentrePage({
  session,
  onSessionUpdate,
  onNavigateToKnockout,
}: MatchCentreProps) {
  const {
    activeMatchday,
    setActiveMatchday,
    totalMatchdays,
    simulating,
    error,
    isGroupStageComplete,
    filteredFixtures,
    simulateMatch,
    simulateAllUnplayed,
  } = useMatchCentre({ session, onSessionUpdate });

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Completion Banner for Group Stage */}
      {isGroupStageComplete && (
        <GroupStageCompletionBanner onNavigateToKnockout={onNavigateToKnockout} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Fixture List Schedule Management */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight uppercase">
                Match Schedule
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track and simulate matchday progression blocks.
              </p>
            </div>
            <button
              onClick={simulateAllUnplayed}
              disabled={simulating || isGroupStageComplete}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-lg shadow uppercase tracking-wider transition-all"
            >
              {simulating
                ? 'Simulating...'
                : isGroupStageComplete
                ? 'Group Stage Done'
                : 'Simulate All'}
            </button>
          </div>

          {/* DYNAMIC MATCHDAY TABS */}
          <MatchdayTabs
            activeMatchday={activeMatchday}
            onSelectMatchday={setActiveMatchday}
            fixtures={session.fixtures}
            totalMatchdays={totalMatchdays}
          />

          {/* Fixtures Feed Cards */}
          <div className="space-y-3 max-h-[68vh] overflow-y-auto pr-1">
            {filteredFixtures.map((fixture: MatchFixture) => (
              <FixtureCard
                key={fixture.id}
                fixture={fixture}
                onSimulate={simulateMatch}
              />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Standings & 3rd Place Tracker */}
        <div className="lg:col-span-7 space-y-6 max-h-[85vh] overflow-y-auto pr-1">
          {/* Third Place Cross-Group Rankings */}
          <ThirdPlaceStandingsTable
            groups={session.groups}
            totalFixtures={totalMatchdays}
            nthPlacePositionQualifier={session.nthPlaceQualificationPosition}
            nthPlacePositionCandidates={session.nthPlaceNumberOfCandidates}
          />

          {/* All Group Standings Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.groups.map((group: GroupState) => (
              <GroupStandingsTable key={group.name} group={group} totalFixtures={totalMatchdays} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}