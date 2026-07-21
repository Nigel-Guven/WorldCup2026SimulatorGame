using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application;

public class KnockoutBracketService: IKnockoutBracketService
{
    public List<ThirdPlaceCandidate> GetTopEightThirdPlaceTeams(TournamentSession session)
    {
        var candidates = (from @group in session.Groups
            where @group.Standings.Count >= 3
            let thirdPlaceStanding = @group.Standings[2]
            let team = session.Fixtures.SelectMany(f => new[] { f.HomeTeam, f.AwayTeam })
                .First(t => t.Id == thirdPlaceStanding.TeamId)
            select new ThirdPlaceCandidate { GroupName = @group.Name, Standing = thirdPlaceStanding, Team = team }).ToList();
        
        return candidates
            .OrderByDescending(c => c.Standing.Points)
            .ThenByDescending(c => c.Standing.GoalDifference)
            .ThenByDescending(c => c.Standing.GoalsFor)
            .ThenByDescending(c => c.Standing.Won)
            .ThenByDescending(c => c.Team.Strength)
            .Take(8)
            .ToList();
    }

    public KnockoutBracket GenerateRoundOf32(TournamentSession session)
    {
        var bracket = new KnockoutBracket();

        var groupWinners = new Dictionary<string, Country>();
        var groupRunnersUp = new Dictionary<string, Country>();

        foreach (var group in session.Groups)
        {
            var winnerStanding = group.Standings[0];
            var runnerUpStanding = group.Standings[1];

            groupWinners[group.Name] = session.Fixtures
                .SelectMany(f => new[] { f.HomeTeam, f.AwayTeam })
                .First(t => t.Id == winnerStanding.TeamId);

            groupRunnersUp[group.Name] = session.Fixtures
                .SelectMany(f => new[] { f.HomeTeam, f.AwayTeam })
                .First(t => t.Id == runnerUpStanding.TeamId);
        }
        
        var thirdPlacePool = GetTopEightThirdPlaceTeams(session);
        
        Country DrawThirdPlaceAvoidingGroup(string winnerGroupName)
        {
            var match = thirdPlacePool.FirstOrDefault(c => c.GroupName != winnerGroupName) 
                         ?? thirdPlacePool.First();

            thirdPlacePool.Remove(match);
            return match.Team;
        }

        var r32Pairings = new List<(Country Home, Country Away)>
        {
            (groupWinners["A"], DrawThirdPlaceAvoidingGroup("A")),
            (groupRunnersUp["B"], groupRunnersUp["C"]),
            (groupWinners["D"], DrawThirdPlaceAvoidingGroup("D")),
            (groupRunnersUp["E"], groupRunnersUp["F"]),

            (groupWinners["B"], DrawThirdPlaceAvoidingGroup("B")),
            (groupRunnersUp["A"], groupRunnersUp["D"]),
            (groupWinners["C"], DrawThirdPlaceAvoidingGroup("C")),
            (groupRunnersUp["G"], groupRunnersUp["H"]),

            (groupWinners["E"], DrawThirdPlaceAvoidingGroup("E")),
            (groupRunnersUp["I"], groupRunnersUp["J"]),
            (groupWinners["F"], DrawThirdPlaceAvoidingGroup("F")),
            (groupRunnersUp["K"], groupRunnersUp["L"]),

            (groupWinners["G"], DrawThirdPlaceAvoidingGroup("G")),
            (groupRunnersUp["H"], groupRunnersUp["E"]),
            (groupWinners["H"], DrawThirdPlaceAvoidingGroup("H")),
            (groupRunnersUp["L"], groupRunnersUp["I"])
        };

        for (var i = 0; i < r32Pairings.Count; i++)
        {
            bracket.RoundOf32.Add(new KnockoutMatch
            {
                MatchNumber = i + 1,
                Stage = "R32",
                HomeTeam = r32Pairings[i].Home,
                AwayTeam = r32Pairings[i].Away
            });
        }

        InitializeNextRounds(bracket);

        return bracket;
    }

    public void AdvanceBracket(KnockoutBracket bracket)
    {
        AdvanceRound(bracket.RoundOf32, bracket.RoundOf16);
        
        AdvanceRound(bracket.RoundOf16, bracket.QuarterFinals);

        AdvanceRound(bracket.QuarterFinals, bracket.SemiFinals);

        if (bracket.SemiFinals.All(m => m.IsPlayed))
        {
            bracket.Final.HomeTeam = bracket.SemiFinals[0].Winner;
            bracket.Final.AwayTeam = bracket.SemiFinals[1].Winner;

            var sf1Loser = bracket.SemiFinals[0].Winner == bracket.SemiFinals[0].HomeTeam 
                ? bracket.SemiFinals[0].AwayTeam 
                : bracket.SemiFinals[0].HomeTeam;

            var sf2Loser = bracket.SemiFinals[1].Winner == bracket.SemiFinals[1].HomeTeam 
                ? bracket.SemiFinals[1].AwayTeam 
                : bracket.SemiFinals[1].HomeTeam;

            bracket.ThirdPlaceMatch.HomeTeam = sf1Loser;
            bracket.ThirdPlaceMatch.AwayTeam = sf2Loser;
        }
        
        if (bracket.Final.IsPlayed)
        {
            bracket.Champion = bracket.Final.Winner;
        }
    }

    private static void AdvanceRound(List<KnockoutMatch> currentRound, List<KnockoutMatch> nextRound)
    {
        for (var i = 0; i < nextRound.Count; i++)
        {
            var match1 = currentRound[i * 2];
            var match2 = currentRound[(i * 2) + 1];

            if (match1.IsPlayed) nextRound[i].HomeTeam = match1.Winner;
            if (match2.IsPlayed) nextRound[i].AwayTeam = match2.Winner;
        }
    }

    private static void InitializeNextRounds(KnockoutBracket bracket)
    {
        for (var i = 1; i <= 8; i++)
            bracket.RoundOf16.Add(new KnockoutMatch { MatchNumber = i, Stage = "R16" });

        for (var i = 1; i <= 4; i++)
            bracket.QuarterFinals.Add(new KnockoutMatch { MatchNumber = i, Stage = "QF" });

        for (var i = 1; i <= 2; i++)
            bracket.SemiFinals.Add(new KnockoutMatch { MatchNumber = i, Stage = "SF" });

        bracket.ThirdPlaceMatch = new KnockoutMatch { MatchNumber = 1, Stage = "ThirdPlace" };
        bracket.Final = new KnockoutMatch { MatchNumber = 1, Stage = "Final" };
    }
}