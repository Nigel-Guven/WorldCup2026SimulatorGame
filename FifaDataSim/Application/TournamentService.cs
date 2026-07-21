using WorldCupSimulator.Contracts;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application;

public class TournamentService : ITournamentService
{
    private TournamentSession? _activeSession;

    public TournamentSession? GetCurrentSession() => _activeSession;

    public TournamentSession CreateNewSession(List<GroupSetupDto> groupsFromFrontend)
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
            
            var t = g.Teams;
            if (t.Count != 4) continue;
            session.Fixtures.Add(new MatchFixture { GroupName = g.Name, Matchday = 1, HomeTeam = t[0], AwayTeam = t[3] });
            session.Fixtures.Add(new MatchFixture { GroupName = g.Name, Matchday = 1, HomeTeam = t[1], AwayTeam = t[2] });

            session.Fixtures.Add(new MatchFixture { GroupName = g.Name, Matchday = 2, HomeTeam = t[3], AwayTeam = t[2] });
            session.Fixtures.Add(new MatchFixture { GroupName = g.Name, Matchday = 2, HomeTeam = t[0], AwayTeam = t[1] });

            session.Fixtures.Add(new MatchFixture { GroupName = g.Name, Matchday = 3, HomeTeam = t[1], AwayTeam = t[3] });
            session.Fixtures.Add(new MatchFixture { GroupName = g.Name, Matchday = 3, HomeTeam = t[2], AwayTeam = t[0] });
        }

        _activeSession = session;
        return session;
    }

    public void UpdateFixtureScore(Guid fixtureId, int homeScore, int awayScore)
    {
        if (_activeSession == null) return;

        var fixture = _activeSession.Fixtures.FirstOrDefault(f => f.Id == fixtureId);
        if (fixture == null) return;

        fixture.HomeScore = homeScore;
        fixture.AwayScore = awayScore;

        RecalculateStandings(_activeSession, fixture.GroupName);
    }

    private void RecalculateStandings(TournamentSession session, string groupName)
    {
        var group = session.Groups.FirstOrDefault(g => g.Name == groupName);
        if (group == null) return;
        
        foreach (var standing in group.Standings)
        {
            standing.Played = 0; standing.Won = 0; standing.Drawn = 0; standing.Lost = 0;
            standing.GoalsFor = 0; standing.GoalsAgainst = 0;
        }

        var groupMatches = session.Fixtures.Where(f => f.GroupName == groupName && f.IsPlayed);

        foreach (var m in groupMatches)
        {
            var home = group.Standings.First(s => s.TeamId == m.HomeTeam.Id);
            var away = group.Standings.First(s => s.TeamId == m.AwayTeam.Id);

            home.Played++;
            away.Played++;
            home.GoalsFor += m.HomeScore!.Value;
            home.GoalsAgainst += m.AwayScore!.Value;
            away.GoalsFor += m.AwayScore!.Value;
            away.GoalsAgainst += m.HomeScore!.Value;

            if (m.HomeScore > m.AwayScore) { home.Won++; away.Lost++; }
            else if (m.AwayScore > m.HomeScore) { away.Won++; home.Lost++; }
            else { home.Drawn++; away.Drawn++; }
        }

        group.Standings = group.Standings
            .OrderByDescending(s => s.Points)
            .ThenByDescending(s => s.GoalDifference)
            .ThenByDescending(s => s.GoalsFor)
            .ToList();
    }
    public List<ThirdPlaceCandidate> GetTopThirdPlaceTeams(TournamentSession session)
    {
        var candidates = session.Groups
            .Where(g => g.Standings.Count >= 3)
            .Select(g => new ThirdPlaceCandidate
            {
                GroupName = g.Name,
                Standing = g.Standings[2] // 3rd position in zero-indexed list
            })
            .OrderByDescending(c => c.Standing.Points)
            .ThenByDescending(c => c.Standing.GoalDifference)
            .ThenByDescending(c => c.Standing.GoalsFor)
            .ThenByDescending(c => c.Standing.Won)
            .Take(8)
            .ToList();

        return candidates;
    }
    
    public void CheckAndSetGroupStageCompletion(TournamentSession session)
    {
        if (session.Fixtures.Count == 36 && session.Fixtures.All(f => f.IsPlayed))
        {
            session.IsGroupStageCompleted = true;
        }
    }
}