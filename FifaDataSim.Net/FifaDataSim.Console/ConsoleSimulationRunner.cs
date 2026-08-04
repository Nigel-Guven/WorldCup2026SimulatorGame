using WorldCupSimulator.Application.PotSeeding;
using WorldCupSimulator.Application.Simulations;
using WorldCupSimulator.Models;

namespace FifaDataSim.Console;

public class ConsoleSimulationRunner(IPotSeedingService potSeedingService, ISimulationEngine simulationEngine)
{
    private List<Country> _confederationPool = new();
    private List<Country> _previousPhaseWinners = new();

    public async Task RunConfederationAsync(TourneyFactory.ConfederationConfig config, List<Country> availableTeams)
    {
        System.Console.WriteLine($"\n=== Starting {config.Id} Qualification ===");
        
        var currentPhaseTeams = new List<Country>();

        foreach (var phaseConfig in config.Phases.OrderBy(p => p.PhaseNumber))
        {
            System.Console.WriteLine($"\n--- Setup Phase {phaseConfig.PhaseNumber} ---");
            
            // 1. Gather teams for this phase
            currentPhaseTeams = GetTeamsForPhase(availableTeams, phaseConfig);

            // 2. Perform the Interactive Draw
            var groups = PerformInteractiveDraw(phaseConfig, currentPhaseTeams);

            // 3. Generate and Simulate Matches
            var winners = SimulatePhase(groups, phaseConfig);

            // 4. Winners become the pool for the next phase
            availableTeams = PrepareForNextPhase(availableTeams, winners, phaseConfig);
        }
    }
    
    private List<TournamentGroup> PerformInteractiveDraw(TourneyFactory.PhaseConfig phase, List<Country> teams)
    {
        int numGroups = phase.Format?.Groups ?? phase.Format?.Paths ?? 1;
    
        var groups = Enumerable.Range(1, numGroups)
            .Select(i => new TournamentGroup { Name = $"Group {(char)('A' + i - 1)}" })
            .ToList();

        var pots = potSeedingService.GeneratePots(teams, numGroups);

        System.Console.WriteLine($"\n>>> Press ENTER to begin the draw for Phase {phase.PhaseNumber}...");
        System.Console.ReadLine();

        for (int potIndex = 0; potIndex < pots.Count; potIndex++)
        {
            System.Console.WriteLine($"\n--- Drawing Pot {potIndex + 1} ---");
            var currentPot = pots[potIndex];

            var randomizedPot = currentPot.OrderBy(x => Guid.NewGuid()).ToList();

            for (int i = 0; i < randomizedPot.Count; i++)
            {
                var team = randomizedPot[i];
            
                System.Console.Write("Press ENTER to draw next team...");
                System.Console.ReadLine();

                var targetGroup = groups[i % numGroups];
                targetGroup.Teams.Add(new TournamentTeam { Country = team });

                System.Console.ForegroundColor = ConsoleColor.Green;
                System.Console.WriteLine($"[DRAW] {team.Name} has been drawn into {targetGroup.Name}!");
                System.Console.ResetColor();
            }
        }

        System.Console.WriteLine("\n=== Draw Completed! Final Groups ===");
        foreach (var group in groups)
        {
            System.Console.WriteLine($"{group.Name}: {string.Join(", ", group.Teams.Select(t => t.Country.ShortName))}");
        }

        return groups;
    }
    
    private List<Country> SimulatePhase(List<TournamentGroup> groups, TourneyFactory.PhaseConfig phase)
    {
        System.Console.WriteLine("\n>>> Press ENTER to simulate fixtures...");
        System.Console.ReadLine();

        var advancingTeams = new List<Country>();

        foreach (var group in groups)
        {
            System.Console.WriteLine($"\n--- Simulating {group.Name} ---");
        
            var matches = GenerateFixturesForGroup(group, phase);

            foreach (var match in matches)
            {
                var result = simulationEngine.SimulateMatch(match.HomeTeam, match.AwayTeam);
            
                match.HomeScore = result.HomeScore;
                match.AwayScore = result.AwayScore;
                match.IsPlayed = true;

                System.Console.WriteLine($"{match.HomeTeam} {result.HomeScore} - {result.AwayScore} {match.AwayTeam}");
            }

            // Determine how many teams advance based on config (fallback to 1 if not set)
            int advanceCount = phase.Progression?.AdvancingPerGroup ?? phase.Progression?.AdvancingPerPath ?? 1;
            
            var groupWinners = CalculateStandings(group.Teams, matches).Take(advanceCount);
            advancingTeams.AddRange(groupWinners.Select(t => t.Country));
        }

        System.Console.WriteLine($"\n{advancingTeams.Count} teams advance to the next phase!");
        return advancingTeams;
    }
    
    private List<Country> GetTeamsForPhase(List<Country> availableTeams, TourneyFactory.PhaseConfig phase)
    {
        var teamsForThisPhase = new List<Country>();
        var rankedPool = availableTeams.OrderByDescending(t => t.DefaultRankingPoints).ToList();

        // Null check and heuristic parsing based on SeedCriteria strings
        if (!string.IsNullOrEmpty(phase.SeedCriteria) && phase.SeedCriteria.Contains("Bottom", StringComparison.OrdinalIgnoreCase))
        {
            int count = phase.ParticipatingTeams;
            teamsForThisPhase.AddRange(rankedPool.TakeLast(count));
            availableTeams.RemoveAll(t => teamsForThisPhase.Contains(t)); 
        }
        else
        {
            int newTeamsNeeded = phase.ParticipatingTeams - _previousPhaseWinners.Count;
            teamsForThisPhase.AddRange(rankedPool.Take(newTeamsNeeded));
            teamsForThisPhase.AddRange(_previousPhaseWinners);
            availableTeams.RemoveAll(t => rankedPool.Take(newTeamsNeeded).Contains(t));
        }

        return teamsForThisPhase;
    }

    private List<Country> PrepareForNextPhase(List<Country> availableTeams, List<Country> winners, TourneyFactory.PhaseConfig phase)
    {
        _previousPhaseWinners = winners;
        return availableTeams; 
    }

    private List<MatchFixture> GenerateFixturesForGroup(TournamentGroup group, TourneyFactory.PhaseConfig phase)
{
    var matches = new List<MatchFixture>();
    
    // Create a dictionary for fast lookup of Country objects by their ID string
    var teamDict = group.Teams.ToDictionary(t => t.Country.Id, t => t.Country);
    var teamIds = teamDict.Keys.ToList();

    // Null check for Phase Type
    if (!string.IsNullOrEmpty(phase.Type) && phase.Type.Contains("Knockout", StringComparison.OrdinalIgnoreCase))
    {
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
        // Round Robin implementation
        if (teamIds.Count % 2 != 0) teamIds.Add("BYE"); 

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

    private IEnumerable<TournamentTeam> CalculateStandings(List<TournamentTeam> teams, List<MatchFixture> matches)
    {
        var stats = teams.ToDictionary(t => t.Country.Id, t => new TeamStats { Country = t.Country });

        foreach (var match in matches.Where(m => m.IsPlayed))
        {
            if (match.HomeScore == null || match.AwayScore == null) continue;
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

        var sortedCountries = stats.Values
            .OrderByDescending(s => s.Points)
            .ThenByDescending(s => s.GoalDifference)
            .ThenByDescending(s => s.GoalsFor)
            .Select(s => s.Country.Id)
            .ToList();

        return sortedCountries.Select(id => teams.First(t => t.Country.Id == id));
    }
}