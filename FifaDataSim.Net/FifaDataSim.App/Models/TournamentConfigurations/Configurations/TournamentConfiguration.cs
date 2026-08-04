using WorldCupSimulator.Models.TournamentConfigurations.Phase;

namespace WorldCupSimulator.Models.TournamentConfigurations;

public class TournamentConfiguration
{
    public string Code { get; init; }
    public string Name { get; init; }
    public int TotalTeams { get; init; }
    public List<TournamentPhaseConfig> Phases { get; init; } = [];
}