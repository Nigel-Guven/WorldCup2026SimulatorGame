using WorldCupSimulator.Models;

namespace FifaDataSim.Console;

public class FixGenerator
{
    public List<MatchFixture> GenerateFixturesForGroup(TournamentGroup group, TourneyFactory.PhaseConfig phase)
    {
        var matches = new List<MatchFixture>();
        
        // Keep a dictionary for quick lookup of Country objects by their ID
        var teamDict = group.Teams.ToDictionary(t => t.Country.Id, t => t.Country);
        var teamIds = teamDict.Keys.ToList();

        if (!string.IsNullOrEmpty(phase.Type) && phase.Type.Contains("Knockout", StringComparison.OrdinalIgnoreCase))
        {
            // Knockout: Pair 1v2, 3v4, etc.
            for (int i = 0; i < teamIds.Count; i += 2)
            {
                if (i + 1 < teamIds.Count)
                {
                    matches.Add(new MatchFixture 
                    { 
                        HomeTeam = teamDict[teamIds[i]], 
                        AwayTeam = teamDict[teamIds[i + 1]], 
                        GroupName = group.Name 
                    });
                }
            }
        }
        else
        {
            // Group Stage / League: Single Round-Robin (Circle Algorithm)
            if (teamIds.Count % 2 != 0) teamIds.Add("BYE"); // Handle odd numbers of teams

            int numDays = teamIds.Count - 1;
            int halfSize = teamIds.Count / 2;
            var teamsCopy = new List<string>(teamIds);
            teamsCopy.RemoveAt(0);

            for (int day = 0; day < numDays; day++)
            {
                int teamIdx = day % teamsCopy.Count;
                if (teamsCopy[teamIdx] != "BYE" && teamIds[0] != "BYE")
                {
                    matches.Add(new MatchFixture 
                    { 
                        HomeTeam = teamDict[teamIds[0]], 
                        AwayTeam = teamDict[teamsCopy[teamIdx]], 
                        GroupName = group.Name, 
                        MatchDay = day + 1 
                    });
                }

                for (int idx = 1; idx < halfSize; idx++)
                {
                    int firstTeam = (day + idx) % teamsCopy.Count;
                    int secondTeam = (day + teamsCopy.Count - idx) % teamsCopy.Count;
                
                    if (teamsCopy[firstTeam] != "BYE" && teamsCopy[secondTeam] != "BYE")
                    {
                        matches.Add(new MatchFixture 
                        { 
                            HomeTeam = teamDict[teamsCopy[firstTeam]], 
                            AwayTeam = teamDict[teamsCopy[secondTeam]], 
                            GroupName = group.Name, 
                            MatchDay = day + 1 
                        });
                    }
                }
            }
        }

        return matches;
    }
    
    private class TeamStats
    {
        public Country Country { get; set; } = null!;
        public int Points { get; set; }
        public int GoalDifference { get; set; }
        public int GoalsFor { get; set; }
    }

    public IEnumerable<TournamentTeam> CalculateStandings(List<TournamentTeam> teams, List<MatchFixture> matches)
    {
        // Initialize stats for everyone
        var stats = teams.ToDictionary(t => t.Country.Id, t => new TeamStats { Country = t.Country });

        foreach (var match in matches.Where(m => m.IsPlayed))
        {
            if (match.HomeScore == null || match.AwayScore == null) continue;
            if (match.HomeTeam == null || match.AwayTeam == null) continue;
            if (!stats.ContainsKey(match.HomeTeam.Id) || !stats.ContainsKey(match.AwayTeam.Id)) continue;

            var homeStats = stats[match.HomeTeam.Id];
            var awayStats = stats[match.AwayTeam.Id];

            homeStats.GoalsFor += match.HomeScore.Value;
            homeStats.GoalDifference += (match.HomeScore.Value - match.AwayScore.Value);

            awayStats.GoalsFor += match.AwayScore.Value;
            awayStats.GoalDifference += (match.AwayScore.Value - match.HomeScore.Value);

            if (match.HomeScore > match.AwayScore) homeStats.Points += 3;
            else if (match.AwayScore > match.HomeScore) awayStats.Points += 3;
            else
            {
                homeStats.Points += 1;
                awayStats.Points += 1;
            }
        }

        // Sort by Points -> Goal Difference -> Goals Scored
        var sortedCountries = stats.Values
            .OrderByDescending(s => s.Points)
            .ThenByDescending(s => s.GoalDifference)
            .ThenByDescending(s => s.GoalsFor)
            .Select(s => s.Country.Id)
            .ToList();

        // Return the original TournamentTeam objects in the correct ranked order
        return sortedCountries.Select(id => teams.First(t => t.Country.Id == id));
    }
}