using WorldCupSimulator.Contracts;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application;

public interface ITournamentService
{
    TournamentSession CreateNewSession(List<GroupSetupDto> groupsFromFrontend, bool isRoundRobin,
        int nthPlaceCutoffPosition, int nthPlaceCandidates);
    TournamentSession? GetCurrentSession();
    void UpdateFixtureScore(Guid fixtureId, int homeScore, int awayScore);
}