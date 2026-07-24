using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Application.PotSeeding;

public class PotSeedingService : IPotSeedingService
{
    public List<List<Country>> GeneratePots(IEnumerable<Country> teams, IEnumerable<Country>? hosts, TournamentConfiguration config)
    {
        var potConfig = config.Pots 
                        ?? throw new InvalidOperationException($"Tournament configuration '{config.Name}' has no PotConfig defined.");

        var totalPots = potConfig.TotalPots;
        var teamsPerPot = config.TotalTeams / totalPots;

        var hostList = hosts.ToList();
        var hostIds = hostList.Select(h => h.Id).ToHashSet();
        
        var nonHostTeams = teams.Where(t => !hostIds.Contains(t.Id)).ToList();

        var sortedNonHosts = potConfig.SortingType switch
        {
            PotSortingType.Strict => nonHostTeams,

            PotSortingType.WorldRanking => nonHostTeams
                .OrderByDescending(t => t.DefaultRankingPoints)
                .ToList(),

            PotSortingType.ConfederationBalanced => nonHostTeams
                .GroupBy(t => t.Confederation)
                .SelectMany(g => g.OrderByDescending(t => t.DefaultRankingPoints))
                .ToList(),

            _ => nonHostTeams.ToList()
        };
        
        var pot1 = new List<Country>();
    
        if (potConfig.HostInPotOne)
        {
            pot1.AddRange(hostList);
        }

        var pot1Remainder = teamsPerPot - pot1.Count;
        if (pot1Remainder > 0)
        {
            pot1.AddRange(sortedNonHosts.Take(pot1Remainder));
        }

        var pots = new List<List<Country>> { pot1 };

        var remainingPool = sortedNonHosts.Skip(pot1Remainder).ToList();
        for (var i = 1; i < totalPots; i++)
        {
            var pot = remainingPool
                .Skip((i - 1) * teamsPerPot)
                .Take(teamsPerPot)
                .ToList();

            pots.Add(pot);
        }

        return pots;
    }
}