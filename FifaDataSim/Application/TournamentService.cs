using WorldCupSimulator.Contracts;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application;

public class TournamentService : ITournamentService
{
    private TournamentSession? _activeSession;

    public TournamentSession? GetCurrentSession() => _activeSession;

    public TournamentSession CreateNewSession(List<GroupSetupDto> groupsFromFrontend, bool isRoundRobin)
    {
        var session = new TournamentSession();

        foreach (var g in groupsFromFrontend)
        {
            var groupState = new GroupState
            {
                Name = g.Name,
                Standings = g.Teams.Select(t => new GroupTeamStanding
                {
                    TeamId = t.Id,
                    TeamName = t.Name,
                    FlagUrl = t.FlagUrl
                }).ToList()
            };

            session.Groups.Add(groupState);

            if (g.Teams.Count < 2) continue;
            var groupFixtures = GenerateRoundRobinFixtures(g.Name, g.Teams, isRoundRobin);
            session.Fixtures.AddRange(groupFixtures);
        }

        _activeSession = session;
        return session;
    }

    public void UpdateFixtureScore(Guid fixtureId, int homeScore, int awayScore)
    {
        if (_activeSession == null) return;

        var fixture = _activeSession.Fixtures.FirstOrDefault(f => f.Id == fixtureId);
        if (fixture == null) return;

        if (fixture.HomeTeam == null || fixture.AwayTeam == null)
        {
            fixture.IsPlayed = true;
            return;
        }

        fixture.HomeScore = homeScore;
        fixture.AwayScore = awayScore;
        fixture.IsPlayed = true;

        RecalculateStandings(_activeSession, fixture.GroupName);
    }

    private void RecalculateStandings(TournamentSession session, string groupName)
    {
        var group = session.Groups.FirstOrDefault(g => g.Name == groupName);
        if (group == null) return;
        
        foreach (var standing in group.Standings)
        {
            standing.Played = 0;
            standing.Won = 0;
            standing.Drawn = 0;
            standing.Lost = 0;
            standing.GoalsFor = 0;
            standing.GoalsAgainst = 0;
        }
        
        var groupMatches = session.Fixtures.Where(f => 
            f.GroupName == groupName && 
            f.IsPlayed && 
            f.HomeTeam != null && 
            f.AwayTeam != null
        );

        foreach (var m in groupMatches)
        {

            var home = group.Standings.FirstOrDefault(s => s.TeamId == m.HomeTeam.Id);
            var away = group.Standings.FirstOrDefault(s => s.TeamId == m.AwayTeam.Id);

            if (home == null || away == null) continue;

            int hScore = m.HomeScore ?? 0;
            int aScore = m.AwayScore ?? 0;

            home.Played++;
            away.Played++;
            home.GoalsFor += hScore;
            home.GoalsAgainst += aScore;
            away.GoalsFor += aScore;
            away.GoalsAgainst += hScore;

            if (hScore > aScore)
            {
                home.Won++;
                away.Lost++;
            }
            else if (aScore > hScore)
            {
                away.Won++;
                home.Lost++;
            }
            else
            {
                home.Drawn++;
                away.Drawn++;
            }
        }
        
        group.Standings = group.Standings
            .OrderByDescending(s => s.Points)
            .ThenByDescending(s => s.GoalDifference)
            .ThenByDescending(s => s.GoalsFor)
            .ToList();
    }
    
    private static List<MatchFixture> GenerateRoundRobinFixtures(string groupName, List<Country> teams, bool isRoundRobin)
    {
        var fixtures = new List<MatchFixture>();
        var teamList = teams.ToList();

        var hasBye = teamList.Count % 2 != 0;
        if (hasBye)
        {
            teamList.Add(null!);
        }

        var totalTeams = teamList.Count; 
        var totalMatchdays = totalTeams - 1;
        var matchesPerRound = totalTeams / 2;

        for (int matchday = 1; matchday <= totalMatchdays; matchday++)
        {
            for (int i = 0; i < matchesPerRound; i++)
            {
                var home = teamList[i];
                var away = teamList[totalTeams - 1 - i];

                if (i == 0 && matchday % 2 == 0)
                {
                    (home, away) = (away, home);
                }

                if (home == null || away == null) 
                    continue;

                fixtures.Add(new MatchFixture
                {
                    GroupName = groupName,
                    Matchday = matchday,
                    HomeTeam = home,
                    AwayTeam = away
                });

                if (isRoundRobin)
                {
                    fixtures.Add(new MatchFixture
                    {
                        GroupName = groupName,
                        Matchday = matchday + totalMatchdays,
                        HomeTeam = away,
                        AwayTeam = home
                    });
                }
            }
            
            var last = teamList[^1];
            teamList.RemoveAt(teamList.Count - 1);
            teamList.Insert(1, last);
        }

        return fixtures;
    }
}
