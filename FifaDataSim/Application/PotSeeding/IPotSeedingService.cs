using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Phase;

namespace WorldCupSimulator.Application.PotSeeding;

public interface IPotSeedingService
{
    List<Pot> GeneratePots(IEnumerable<Country> teams, IEnumerable<Country>? hosts, TournamentPhaseConfig phaseConfig);
}