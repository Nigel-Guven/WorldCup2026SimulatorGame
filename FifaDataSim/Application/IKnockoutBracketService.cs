using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application;

public interface IKnockoutBracketService
{
    List<ThirdPlaceCandidate> GetTopNthPlaceTeams(TournamentSession session);
    KnockoutBracket GenerateRoundOf32(TournamentSession session);
    void AdvanceBracket(KnockoutBracket bracket);
}