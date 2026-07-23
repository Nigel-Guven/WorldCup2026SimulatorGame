using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Application.PotSeeding;

public class PotSeedingService : IPotSeedingService
{
    public List<List<Country>> GeneratePots(IEnumerable<Country> teams, TournamentConfiguration config)
    {
        var potConfig = config.Pots 
                        ?? throw new InvalidOperationException($"Tournament configuration '{config.Name}' has no PotConfig defined.");

        var totalPots = potConfig.TotalPots;
        var teamsPerPot = config.TotalTeams / totalPots;

        var remainingTeams = teams.ToList();
        
        List<Country> hosts = [];
        if (potConfig.HostInPotOne)
        {
            hosts = remainingTeams.Where(t => t.IsHost).ToList();
            remainingTeams.RemoveAll(t => t.IsHost);
        }

        var sortedTeams = potConfig.SortingType switch
        {
            PotSortingType.WorldRanking => remainingTeams
                .OrderByDescending(t => t.DefaultRankingPoints)
                .ToList(),

            PotSortingType.ConfederationBalanced => remainingTeams
                .GroupBy(t => t.Confederation)
                .SelectMany(g => g.OrderByDescending(t => t.DefaultRankingPoints))
                .ToList(),

            _ => remainingTeams.OrderByDescending(t => t.DefaultRankingPoints).ToList()
        };
        
        var pot1 = new List<Country>(hosts);
        var pot1Remainder = teamsPerPot - pot1.Count;
        pot1.AddRange(sortedTeams.Take(pot1Remainder));

        var pots = new List<List<Country>> { pot1 };

        var remainingSorted = sortedTeams.Skip(pot1Remainder).ToList();
        for (var i = 1; i < totalPots; i++)
        {
            var pot = remainingSorted
                .Skip((i - 1) * teamsPerPot)
                .Take(teamsPerPot)
                .ToList();
            pots.Add(pot);
        }

        return pots;
    }
}