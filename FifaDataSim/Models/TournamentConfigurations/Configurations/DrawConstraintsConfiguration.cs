using WorldCupSimulator.Models.Countries;

namespace WorldCupSimulator.Models.TournamentConfigurations;

public class DrawConstraintsConfiguration
{
    public bool SeparateConfederations { get; init; } = true;

    public Dictionary<Confederation, int> MaxTeamsPerConfederation { get; init; } = new()
    {
        { Confederation.UEFA, 2 },
        { Confederation.AFC, 1 },
        { Confederation.CAF, 1 },
        { Confederation.CONMEBOL, 1 },
        { Confederation.CONCACAF, 1 },
        { Confederation.OFC, 1 },
    };
}