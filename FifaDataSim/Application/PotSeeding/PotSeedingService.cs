using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations;

namespace WorldCupSimulator.Application.PotSeeding;

public class PotSeedingService : IPotSeedingService
{
    public List<List<Country>> GeneratePots(IEnumerable<Country> teams, TournamentConfiguration config)
    {
        var potConfig = config.Pots 
                        ?? throw new InvalidOperationException($"Tournament configuration '{config.Name}' has no PotConfig defined.");

        var totalPots = potConfig.TotalPots;
        var teamsPerPot = config.TotalTeams / totalPots;
        
        var teamList = teams.ToList();

        var pots = new List<List<Country>>();
        
        for (var i = 0; i < totalPots; i++)
        {
            var pot = teamList
                .Skip(i * teamsPerPot)
                .Take(teamsPerPot)
                .ToList();

            pots.Add(pot);
        }

        return pots;
    }
}