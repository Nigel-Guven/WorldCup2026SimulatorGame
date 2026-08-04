using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Phase;

namespace WorldCupSimulator.Application.PotSeeding;

public class PotSeedingService : IPotSeedingService
{
    public List<List<Country>> GeneratePots(IEnumerable<Country> teams, int numberOfGroups)
    {
        if (teams == null || !teams.Any())
            return new List<List<Country>>();

        if (numberOfGroups <= 0)
            throw new ArgumentException("Number of groups must be greater than zero.", nameof(numberOfGroups));
        
        var sortedTeams = teams
            .OrderByDescending(t => t.DefaultRankingPoints)
            .ToList();


        var pots = sortedTeams
            .Chunk(numberOfGroups)
            .Select(pot => pot.ToList())
            .ToList();

        return pots;
    }

    private static (int TotalPots, int TeamsPerPot) GetPotDimensions(TournamentPhaseConfig phaseConfig) => phaseConfig switch
    {
        GroupPhaseConfig g => (g.TeamsPerGroup, g.NumberOfGroups),
        MultiKnockoutPhaseConfig m => (m.TeamsPerPath, m.NumberOfPaths),
        SingleKnockoutPhaseConfig s => (1, s.StartingTeamsCount),
        _ => throw new NotSupportedException($"Pot seeding is not supported for phase type '{phaseConfig.GetType().Name}'.")
    };
}