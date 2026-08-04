using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application.Validators;

public static class KnockoutValidator
{
    public static bool IsValidKnockoutTeamCount(int count)
    {
        if (count <= 0 || count % 2 != 0) return false;
        
        return (count & (count - 1)) == 0;
    }
/*
    public static List<MatchFixture> GenerateKnockoutRound(Guid phaseId, List<string> teamIds, string branchName = "Main", int roundNumber = 1)
    {
        if (!IsValidKnockoutTeamCount(teamIds.Count))
        {
            throw new ArgumentException($"Invalid team count ({teamIds.Count}) for knockout branch '{branchName}'. Must be an even power of 2.");
        }

        var matches = new List<MatchFixture>();
        for (int i = 0; i < teamIds.Count; i += 2)
        {
            matches.Add(new MatchFixture
            {
                PhaseId = Guid.NewGuid().ToString(),
                BranchName = branchName,
                RoundNumber = roundNumber,
                MatchNumber = (i / 2) + 1,
                HomeTeam = teamIds[i],
                AwayTeam = teamIds[i + 1]
            });
        }
        return matches;
    }*/
}