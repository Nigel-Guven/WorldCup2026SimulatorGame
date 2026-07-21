using WorldCupSimulator.Contracts;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application;

public interface ITournamentService
{
    TournamentSession CreateNewSession(List<GroupSetupDto> groupsFromFrontend);
    TournamentSession? GetCurrentSession();
    void UpdateFixtureScore(Guid fixtureId, int homeScore, int awayScore);
}