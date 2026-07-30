using WorldCupSimulator.Application.Evaluators;
using WorldCupSimulator.Application.PotSeeding;
using WorldCupSimulator.Application.Simulations;
using WorldCupSimulator.Contracts;
using WorldCupSimulator.Infrastructure;
using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Phase;

namespace WorldCupSimulator.Application;

public class TournamentService(
    ISessionRepository sessionRepository,
    ICountryRepository countryRepository,
    IPotSeedingService potSeedingService,
    ISimulationEngine simEngine,
    IPhaseEvaluatorFactory rankingEvaluatorFactory) : ITournamentService
{
    // =========================================================================
    // 1. SETUP & DRAW QUERY
    // =========================================================================

    public TournamentDrawSetup? GetDrawSetup(string tournamentCode, string? phaseId)
    {
        var config = TournamentFactory.GetByCode(tournamentCode);

        var targetPhase = string.IsNullOrEmpty(phaseId)
            ? config.Phases.OrderBy(p => p.Order).First()
            : config.Phases.FirstOrDefault(p => p.PhaseId == phaseId);

        if (targetPhase == null) return null;
        
        var eligibleTeams = GetEligibleTeamsForPhase(targetPhase);
        var pots = potSeedingService.GeneratePots(eligibleTeams, null, targetPhase);

        return new TournamentDrawSetup
        {
            TournamentCode = config.Code,
            TournamentName = config.Name,
            PhaseId = targetPhase.PhaseId,
            PhaseType = targetPhase.PhaseType,
            Pots = pots
        };
    }

    // =========================================================================
    // 2. PHASE INITIALIZATION
    // =========================================================================

    public TournamentSession? InitializePhase(PhaseInitializationRequest request)
    {
        var config = TournamentFactory.GetByCode(request.TournamentCode);

        var phaseConfig = config.Phases.FirstOrDefault(p => p.PhaseId == request.PhaseId);
        if (phaseConfig == null) return null;
        
        var session = request.SessionId.HasValue 
            ? sessionRepository.GetById(request.SessionId.Value) 
            : new TournamentSession(config.Code);

        if (session == null) return null;

        // Build state based on polymorphic phase type
        switch (phaseConfig)
        {
            case GroupPhaseConfig groupConfig:
                InitializeGroupPhaseState(session, groupConfig, request.DrawResults);
                break;

            case MultiKnockoutPhaseConfig multiKnockoutConfig:
                InitializeMultiKnockoutPhaseState(session, multiKnockoutConfig, request.DrawResults);
                break;

            case SingleKnockoutPhaseConfig singleKnockoutConfig:
                InitializeSingleKnockoutPhaseState(session, singleKnockoutConfig, request.DrawResults);
                break;

            default:
                throw new NotSupportedException($"Unsupported phase type: {phaseConfig.GetType().Name}");
        }

        sessionRepository.Save(session);
        return session;
    }

    public TournamentSession? GetSession(Guid sessionId) => sessionRepository.GetById(sessionId);

    // =========================================================================
    // 3. FIXTURE & PHASE SIMULATION
    // =========================================================================

    public FixtureSimulationResult? SimulateFixture(Guid sessionId, Guid fixtureId)
    {
        var session = sessionRepository.GetById(sessionId);
        if (session == null) return null;

        var (phaseState, fixture) = session.FindFixtureWithPhase(fixtureId);
        if (fixture == null || fixture.IsPlayed || phaseState == null) return null;

        if (fixture.HomeTeam == null || fixture.AwayTeam == null)
        {
            fixture.IsPlayed = true;
            sessionRepository.Save(session);
            return null;
        }

        var (homeScore, awayScore) = simEngine.SimulateMatch(fixture.HomeTeam, fixture.AwayTeam);
        
        fixture.HomeScore = homeScore;
        fixture.AwayScore = awayScore;
        fixture.IsPlayed = true;
        
        if (phaseState is GroupPhaseState groupPhase)
        {
            RecalculateGroupStandings(groupPhase, fixture.GroupName);
        }

        sessionRepository.Save(session);

        return new FixtureSimulationResult
        {
            FixtureId = fixture.Id,
            PhaseId = phaseState.PhaseId,
            HomeTeam = fixture.HomeTeam,
            AwayTeam = fixture.AwayTeam,
            HomeScore = homeScore,
            AwayScore = awayScore,
            IsPlayed = true,
            IsPhaseCompleted = phaseState.Fixtures.All(f => f.IsPlayed)
        };
    }

    public TournamentSession? SimulatePhase(Guid sessionId, string phaseId)
    {
        var session = sessionRepository.GetById(sessionId);
        if (session == null) return null;

        var phaseState = session.PhaseStates.FirstOrDefault(p => p.PhaseId == phaseId);
        if (phaseState == null) return null;

        var unplayedFixtures = phaseState.Fixtures.Where(f => !f.IsPlayed).ToList();

        foreach (var fixture in unplayedFixtures)
        {
            if (fixture.HomeTeam == null || fixture.AwayTeam == null)
            {
                fixture.IsPlayed = true;
                continue;
            }

            var (homeScore, awayScore) = simEngine.SimulateMatch(fixture.HomeTeam, fixture.AwayTeam);
            fixture.HomeScore = homeScore;
            fixture.AwayScore = awayScore;
            fixture.IsPlayed = true;

            if (phaseState is GroupPhaseState groupPhase)
            {
                RecalculateGroupStandings(groupPhase, fixture.GroupName);
            }
        }

        sessionRepository.Save(session);
        return session;
    }

    // =========================================================================
    // 4. PHASE ADVANCEMENT & PROGRESSION RULES
    // =========================================================================

    public PhaseAdvancementResult AdvancePhase(Guid sessionId, string phaseId)
    {
        var session = sessionRepository.GetById(sessionId) 
            ?? throw new KeyNotFoundException("Session not found.");
            
        var config = TournamentFactory.GetByCode(session.TournamentConfigCode)
            ?? throw new InvalidOperationException($"Tournament configuration missing for {session.TournamentConfigCode}.");

        var phaseConfig = config.Phases.FirstOrDefault(p => p.PhaseId == phaseId)
            ?? throw new InvalidOperationException($"Config for phase {phaseId} missing.");

        var phaseState = session.PhaseStates.FirstOrDefault(p => p.PhaseId == phaseId)
            ?? throw new InvalidOperationException($"State for phase {phaseId} missing.");

        if (!phaseState.Fixtures.All(f => f.IsPlayed))
        {
            throw new InvalidOperationException($"Cannot advance phase {phaseId}. Fixtures remain unplayed.");
        }

        var rankingEvaluator = rankingEvaluatorFactory.GetEvaluator(phaseConfig.PhaseType);
        var teamRankings = rankingEvaluator.CalculateRankings(phaseState);

        var advancementSummary = new PhaseAdvancementResult
        {
            PhaseId = phaseId,
            PhaseName = phaseConfig.PhaseName,
            FinalsQualified = [],
            Eliminated = [],
            RoutedToPhases = []
        };

        foreach (var teamRank in teamRankings)
        {
            var matchingRule = phaseConfig.ProgressionRules.FirstOrDefault(r => 
                teamRank.Rank >= r.StartRank && teamRank.Rank <= r.EndRank);

            if (matchingRule == null)
            {
                throw new InvalidOperationException(
                    $"No progression rule defined for Rank {teamRank.Rank} in phase {phaseId}.");
            }

            switch (matchingRule.TargetPhaseId)
            {
                case Destination.Finals:
                    session.QualifiedTeamCodes.Add(teamRank.Team.Id);
                    advancementSummary.FinalsQualified.Add(teamRank.Team);
                    break;

                case Destination.Eliminated:
                    session.EliminatedTeamCodes.Add(teamRank.Team.Id);
                    advancementSummary.Eliminated.Add(teamRank.Team);
                    break;

                default:
                    session.AddToStaging(matchingRule.TargetPhaseId, teamRank.Team);
                    
                    if (!advancementSummary.RoutedToPhases.ContainsKey(matchingRule.TargetPhaseId))
                    {
                        advancementSummary.RoutedToPhases[matchingRule.TargetPhaseId] = [];
                    }
                    advancementSummary.RoutedToPhases[matchingRule.TargetPhaseId].Add(teamRank.Team);
                    break;
            }
        }

        phaseState.Status = PhaseStatus.Completed;
        CheckTargetPhasesReadiness(session, config);

        sessionRepository.Save(session);
        return advancementSummary;
    }

    // =========================================================================
    // PRIVATE HELPER METHODS
    // =========================================================================

    private List<Country> GetEligibleTeamsForPhase(TournamentPhaseConfig phaseConfig)
    {
        var allTeams = countryRepository.GetTeamsByConfederation(phaseConfig.Confederation);

        return allTeams.ToList();
    }

    private static void InitializeGroupPhaseState(
        TournamentSession session, 
        GroupPhaseConfig config, 
        List<GroupSetupDto> drawResults)
    {
        var phaseState = new GroupPhaseState
        {
            PhaseId = config.PhaseId,
            PhaseName = config.PhaseName,
            Status = PhaseStatus.Active
        };

        foreach (var groupDto in drawResults)
        {
            var group = new TournamentGroup()
            {
                Id = Guid.NewGuid().ToString(),
                Name = groupDto.Name,
                Standings = groupDto.Teams.Select(t => new GroupTeamStanding
                {
                    TeamId = t.Id,
                    TeamName = t.Name,
                    FlagUrl = t.FlagUrl
                }).ToList()
            };

            phaseState.Groups.Add(group);

            if (groupDto.Teams.Count < 2) continue;
            var groupFixtures = GenerateRoundRobinFixtures(config.PhaseId, groupDto.Name, groupDto.Teams, config.IsRoundRobin);
            phaseState.Fixtures.AddRange(groupFixtures);
        }

        session.PhaseStates.Add(phaseState);
    }

    private static void InitializeMultiKnockoutPhaseState(
        TournamentSession session, 
        MultiKnockoutPhaseConfig config, 
        List<GroupSetupDto> drawResults)
    {
        var phaseState = new MultiKnockoutPhaseState
        {
            PhaseId = config.PhaseId,
            PhaseName = config.PhaseName,
            Status = PhaseStatus.Active
        };

        foreach (var pathDto in drawResults)
        {
            var path = new KnockoutPath()
            {
                Id = Guid.NewGuid().ToString(),
                PathName = pathDto.Name,
                Teams = pathDto.Teams
            };
            
            var pathFixtures = GenerateKnockoutPathFixtures(config.PhaseId, pathDto.Name, pathDto.Teams, config.HasTwoLegs);
            phaseState.Fixtures.AddRange(pathFixtures);
            phaseState.Paths.Add(path);
        }

        session.PhaseStates.Add(phaseState);
    }

    private static void InitializeSingleKnockoutPhaseState(
        TournamentSession session, 
        SingleKnockoutPhaseConfig config, 
        List<GroupSetupDto> drawResults)
    {
        var phaseState = new SingleKnockoutPhaseState
        {
            PhaseId = config.PhaseId,
            PhaseName = config.PhaseName,
            Status = PhaseStatus.Active
        };

        var teams = drawResults.SelectMany(d => d.Teams).ToList();
        var fixtures = GenerateKnockoutTreeFixtures(config.PhaseId, teams, config.HasTwoLegs);
        phaseState.Fixtures.AddRange(fixtures);

        session.PhaseStates.Add(phaseState);
    }

    private void RecalculateGroupStandings(GroupPhaseState phaseState, string groupName)
    {
        var group = phaseState.Groups.FirstOrDefault(g => g.Name == groupName);
        if (group == null) return;

        foreach (var standing in group.Standings)
        {
            standing.Played = 0;
            standing.Won = 0;
            standing.Drawn = 0;
            standing.Lost = 0;
            standing.GoalsFor = 0;
            standing.GoalsAgainst = 0;
            standing.LastFiveGames = string.Empty;
        }

        var groupMatches = phaseState.Fixtures.Where(f => 
            f.GroupName == groupName && 
            f.IsPlayed
        );

        foreach (var m in groupMatches)
        {
            if (m.HomeScore == null || m.AwayScore == null) continue;

            var home = group.Standings.FirstOrDefault(s => s.TeamId == m.HomeTeam.Id);
            var away = group.Standings.FirstOrDefault(s => s.TeamId == m.AwayTeam.Id);

            if (home == null || away == null) continue;

            int hScore = m.HomeScore.Value;
            int aScore = m.AwayScore.Value;

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
                home.LastFiveGames += "W";
                away.LastFiveGames += "L";
            }
            else if (aScore > hScore)
            {
                away.Won++;
                home.Lost++;
                home.LastFiveGames += "L";
                away.LastFiveGames += "W";
            }
            else
            {
                home.Drawn++;
                away.Drawn++;
                home.LastFiveGames += "D";
                away.LastFiveGames += "D";
            }

            if (home.LastFiveGames.Length > 5) home.LastFiveGames = home.LastFiveGames[^5..];
            if (away.LastFiveGames.Length > 5) away.LastFiveGames = away.LastFiveGames[^5..];
        }

        group.Standings = group.Standings
            .OrderByDescending(s => s.Points)
            .ThenByDescending(s => s.GoalDifference)
            .ThenByDescending(s => s.GoalsFor)
            .ToList();

        foreach (var standing in group.Standings)
        {
            countryRepository.UpdateCountryForm(standing.TeamId, standing.LastFiveGames);
        }
    }

    private static List<MatchFixture> GenerateRoundRobinFixtures(
        string phaseId, 
        string groupName, 
        List<Country> teams, 
        bool isRoundRobin)
    {
        var fixtures = new List<MatchFixture>();
        var teamList = teams.ToList();

        if (teamList.Count % 2 != 0)
        {
            teamList.Add(null!);
        }

        var totalTeams = teamList.Count;
        var totalMatchDays = totalTeams - 1;
        var matchesPerRound = totalTeams / 2;

        for (var matchDay = 1; matchDay <= totalMatchDays; matchDay++)
        {
            for (var i = 0; i < matchesPerRound; i++)
            {
                var home = teamList[i];
                var away = teamList[totalTeams - 1 - i];

                if (i == 0 && matchDay % 2 == 0)
                {
                    (home, away) = (away, home);
                }

                if (home == null || away == null) continue;
                fixtures.Add(new MatchFixture
                {
                    PhaseId = phaseId,
                    GroupName = groupName,
                    Matchday = matchDay,
                    HomeTeam = home,
                    AwayTeam = away
                });

                if (isRoundRobin)
                {
                    fixtures.Add(new MatchFixture
                    {
                        PhaseId = phaseId,
                        GroupName = groupName,
                        Matchday = matchDay + totalMatchDays,
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

    private static List<MatchFixture> GenerateKnockoutPathFixtures(
        string phaseId, string pathName, List<Country> teams, bool hasTwoLegs)
    {
        var fixtures = new List<MatchFixture>();
        if (teams.Count < 2) return fixtures;
        
        for (var i = 0; i < teams.Count; i += 2)
        {
            fixtures.Add(new MatchFixture
            {
                PhaseId = phaseId,
                GroupName = pathName,
                Matchday = 1,
                HomeTeam = teams[i],
                AwayTeam = teams[i + 1]
            });

            if (hasTwoLegs)
            {
                fixtures.Add(new MatchFixture
                {
                    PhaseId = phaseId,
                    GroupName = pathName,
                    Matchday = 2,
                    HomeTeam = teams[i + 1],
                    AwayTeam = teams[i]
                });
            }
        }

        return fixtures;
    }

    private static List<MatchFixture> GenerateKnockoutTreeFixtures(
        string phaseId, List<Country> teams, bool hasTwoLegs)
    {
        var fixtures = new List<MatchFixture>();
        for (int i = 0; i < teams.Count; i += 2)
        {
            fixtures.Add(new MatchFixture
            {
                PhaseId = phaseId,
                Matchday = 1,
                HomeTeam = teams[i],
                AwayTeam = teams[i + 1]
            });

            if (hasTwoLegs)
            {
                fixtures.Add(new MatchFixture
                {
                    PhaseId = phaseId,
                    Matchday = 2,
                    HomeTeam = teams[i + 1],
                    AwayTeam = teams[i]
                });
            }
        }
        return fixtures;
    }

    private static void CheckTargetPhasesReadiness(TournamentSession session, TournamentConfiguration config)
    {
        foreach (var (targetPhaseId, stagedTeams) in session.PhaseStagingPools)
        {
            var targetConfig = config.Phases.FirstOrDefault(p => p.PhaseId == targetPhaseId);
            if (targetConfig == null) continue;

            var requiredTeams = targetConfig switch
            {
                GroupPhaseConfig g => g.NumberOfGroups * g.TeamsPerGroup,
                MultiKnockoutPhaseConfig m => m.NumberOfPaths * m.TeamsPerPath,
                SingleKnockoutPhaseConfig s => s.StartingTeamsCount,
                _ => 0
            };

            if (stagedTeams.Count != requiredTeams) continue;
            {
                var targetPhaseState = session.PhaseStates.FirstOrDefault(p => p.PhaseId == targetPhaseId);
                if (targetPhaseState is { Status: PhaseStatus.Pending })
                {
                    targetPhaseState.Status = PhaseStatus.ReadyForDraw;
                }
            }
        }
    }
}