import { BracketRoundColumn } from '../components/knockouts/BracketRoundColumn';
import { BracketTabNavigation } from '../components/knockouts/BracketTabNavigation';
import { ChampionBanner } from '../components/knockouts/ChampionBanner';
import KnockoutMatchCard from '../components/knockouts/KnockoutMatchCard';
import { useKnockoutBracket } from '../hooks/useKnockoutBracket';

export default function KnockoutBracketPage() {
  const {
    bracket,
    loading,
    error,
    activeTab,
    setActiveTab,
    simulateMatch,
  } = useKnockoutBracket();

  if (loading || !bracket) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        <p className="text-xl font-medium animate-pulse text-emerald-400">
          Initializing Round of 32 Seeding...
        </p>
      </div>
    );
  }

  const showAll = activeTab === 'ALL';

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Header Banner */}
      <ChampionBanner champion={bracket.champion} />

      {/* Navigation Filter Tabs */}
      <BracketTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Bracket Tree Container */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-6 shadow-2xl overflow-x-auto min-h-[600px]">
        <div className="flex space-x-12 min-w-max items-center justify-center">
          
          {/* Round of 32 */}
          {(showAll || activeTab === 'R32') && (
            <BracketRoundColumn
              title="Round of 32"
              spacingClass="grid grid-cols-1 gap-4"
            >
              {bracket.roundOf32.map((match) => (
                <KnockoutMatchCard
                  key={match.id}
                  match={match}
                  onSimulateMatch={simulateMatch}
                />
              ))}
            </BracketRoundColumn>
          )}

          {/* Round of 16 */}
          {(showAll || activeTab === 'R16') && (
            <BracketRoundColumn
              title="Round of 16"
              spacingClass="flex flex-col justify-around h-full space-y-16"
            >
              {bracket.roundOf16.map((match) => (
                <KnockoutMatchCard
                  key={match.id}
                  match={match}
                  onSimulateMatch={simulateMatch}
                />
              ))}
            </BracketRoundColumn>
          )}

          {/* Quarter Finals */}
          {(showAll || activeTab === 'QF') && (
            <BracketRoundColumn
              title="Quarter Finals"
              spacingClass="flex flex-col justify-around h-full space-y-32"
            >
              {bracket.quarterFinals.map((match) => (
                <KnockoutMatchCard
                  key={match.id}
                  match={match}
                  onSimulateMatch={simulateMatch}
                />
              ))}
            </BracketRoundColumn>
          )}

          {/* Semi Finals */}
          {(showAll || activeTab === 'SF') && (
            <BracketRoundColumn
              title="Semi Finals"
              spacingClass="flex flex-col justify-around h-full space-y-64"
            >
              {bracket.semiFinals.map((match) => (
                <KnockoutMatchCard
                  key={match.id}
                  match={match}
                  onSimulateMatch={simulateMatch}
                />
              ))}
            </BracketRoundColumn>
          )}

          {/* Final & 3rd Place Match */}
          {(showAll || activeTab === 'FINAL') && (
            <div className="space-y-8">
              <BracketRoundColumn
                title="👑 World Cup Final"
                titleColorClass="text-amber-400"
              >
                <KnockoutMatchCard
                  match={bracket.final}
                  onSimulateMatch={simulateMatch}
                />
              </BracketRoundColumn>

              <BracketRoundColumn
                title="3rd Place Match"
                titleColorClass="text-slate-500"
              >
                <KnockoutMatchCard
                  match={bracket.thirdPlaceMatch}
                  onSimulateMatch={simulateMatch}
                />
              </BracketRoundColumn>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}