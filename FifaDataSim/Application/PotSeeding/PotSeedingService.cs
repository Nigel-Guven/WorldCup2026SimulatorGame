using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Phase;

namespace WorldCupSimulator.Application.PotSeeding;

public class PotSeedingService : IPotSeedingService
{
    public List<Pot> GeneratePots(IEnumerable<Country> teams, IEnumerable<Country>? hosts, TournamentPhaseConfig phaseConfig)
    {
        var (totalPots, teamsPerPot) = GetPotDimensions(phaseConfig);

        var hostList = hosts?.Distinct().ToList() ?? [];

        if (hostList.Count > teamsPerPot)
        {
            throw new InvalidOperationException(
                $"Number of host teams ({hostList.Count}) exceeds Pot 1 capacity ({teamsPerPot}).");
        }

        var hostIds = hostList.Select(h => h.Id).ToHashSet();
        
        var nonHostTeams = teams
            .Where(t => !hostIds.Contains(t.Id))
            .ToList();
        
        var remainingPot1Capacity = teamsPerPot - hostList.Count;
        var pot1Teams = hostList
            .Concat(nonHostTeams.Take(remainingPot1Capacity))
            .ToList();
        
        var remainingTeams = nonHostTeams.Skip(remainingPot1Capacity).ToList();

        var pots = new List<Pot>
        {
            new() { Number = 1, Countries = pot1Teams }
        };
        
        for (var i = 1; i < totalPots; i++)
        {
            var potTeams = remainingTeams
                .Skip((i - 1) * teamsPerPot)
                .Take(teamsPerPot)
                .ToList();

            pots.Add(new Pot 
            { 
                Number = i + 1, 
                Countries = potTeams 
            });
        }

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