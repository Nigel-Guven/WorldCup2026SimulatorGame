using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Phase;

namespace WorldCupSimulator.Application.PotSeeding;

public interface IPotSeedingService
{
    List<List<Country>> GeneratePots(IEnumerable<Country> teams, int numberOfGroups);
}