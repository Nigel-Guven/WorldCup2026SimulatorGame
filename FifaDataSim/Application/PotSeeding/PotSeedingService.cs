using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations;

namespace WorldCupSimulator.Application.PotSeeding;

public class PotSeedingService : IPotSeedingService
{
    public List<List<Country>> GeneratePots(IEnumerable<Country> teams, IEnumerable<Country>? hosts, TournamentConfiguration config)
    {
        var potConfig = config.Pots 
                        ?? throw new InvalidOperationException($"Tournament configuration '{config.Name}' has no PotConfig defined.");

        var totalPots = potConfig.TotalPots;
        var teamsPerPot = config.TotalTeams / totalPots;

        var hostList = hosts?.Distinct().ToList() ?? [];

        if (hostList.Count > teamsPerPot)
        {
            throw new InvalidOperationException($"Number of host teams ({hostList.Count}) exceeds Pot 1 capacity ({teamsPerPot}).");
        }

        var hostIds = hostList.Select(h => h.Id).ToHashSet();
        
        var nonHostTeams = teams
            .Where(t => !hostIds.Contains(t.Id))
            .ToList();
        
        var remainingPot1Capacity = teamsPerPot - hostList.Count;
        var pot1 = hostList
            .Concat(nonHostTeams.Take(remainingPot1Capacity))
            .ToList();
        
        var remainingTeams = nonHostTeams.Skip(remainingPot1Capacity).ToList();

        var pots = new List<List<Country>> { pot1 };
        
        for (var i = 1; i < totalPots; i++)
        {
            var pot = remainingTeams
                .Skip((i - 1) * teamsPerPot)
                .Take(teamsPerPot)
                .ToList();

            pots.Add(pot);
        }

        return pots;
    }
}