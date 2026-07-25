using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations;

namespace WorldCupSimulator.Application.PotSeeding;

public interface IPotSeedingService
{
    List<List<Country>> GeneratePots(IEnumerable<Country> teams, TournamentConfiguration config);
}