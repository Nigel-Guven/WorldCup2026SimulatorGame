using WorldCupSimulator.Infrastructure;
using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations.Enums;
using WorldCupSimulator.Models.TournamentConfigurations.Phase;

namespace WorldCupSimulator.Application.Evaluators;

public class GroupPhaseRankingEvaluator(ICountryRepository countryRepository)
{
    public List<TeamRoutingResult> EvaluateGroupPhase(
        GroupPhaseState phaseState, 
        GroupPhaseConfig phaseConfig)
    {
        var routingResults = new List<TeamRoutingResult>();
        var allCountries = countryRepository.GetAllTeams().ToList();
        
        var groupTables = phaseState.Groups.Select(g => CalculateGroupTable(g, allCountries)).ToList();


        foreach (var table in groupTables)
        {
            for (int position = 1; position <= table.Count; position++)
            {
                var teamStats = table[position - 1];
                var team = teamStats.Team;
                
                var directRule = phaseConfig.DirectProgressionRules
                    .FirstOrDefault(r => position >= r.StartRank && position <= r.EndRank);

                if (directRule != null)
                {
                    routingResults.Add(new TeamRoutingResult
                    {
                        Team = team,
                        Status = RoutingStatus.Advanced,
                        TargetPhaseId = directRule.TargetPhaseId,
                        QualificationMethod = $"Rank {position} in {teamStats.OriginalGroupId}"
                    });
                }
                else if (phaseConfig.CrossGroupProgressionRules.All(r => r.GroupPosition != position))
                {
                    routingResults.Add(new TeamRoutingResult
                    {
                        Team = team,
                        Status = RoutingStatus.Eliminated,
                        TargetPhaseId = null,
                        QualificationMethod = $"Eliminated at Rank {position} in {teamStats.OriginalGroupId}"
                    });
                }
            }
        }

        foreach (var crossRule in phaseConfig.CrossGroupProgressionRules)
        {
            var pooledStats = groupTables
                .Where(g => g.Count >= crossRule.GroupPosition)
                .Select(g => g[crossRule.GroupPosition - 1])
                .ToList();

            if (crossRule.ExcludeResultsAgainstLowestRankedTeam)
            {
                // TODO: Requires pulling the group's match fixtures, finding matches against 
                // the last placed team, and subtracting those points/goals from pooledStats.
            }
            
            var sortedPool = SortCrossGroupTeams(pooledStats, crossRule.TieBreakers);

            for (int crossRank = 1; crossRank <= sortedPool.Count; crossRank++)
            {
                var teamStats = sortedPool[crossRank - 1];
                var team = teamStats.Team;

                if (crossRank >= crossRule.StartRank && crossRank <= crossRule.EndRank)
                {
                    routingResults.Add(new TeamRoutingResult
                    {
                        Team = team,
                        Status = RoutingStatus.Advanced,
                        TargetPhaseId = crossRule.TargetPhaseId,
                        QualificationMethod = $"Cross-Group Rank {crossRank} from Position {crossRule.GroupPosition}"
                    });
                }
                else
                {
                    routingResults.Add(new TeamRoutingResult
                    {
                        Team = team,
                        Status = RoutingStatus.Eliminated,
                        TargetPhaseId = null,
                        QualificationMethod = $"Eliminated at Cross-Group Rank {crossRank} from Position {crossRule.GroupPosition}"
                    });
                }
            }
        }

        return routingResults;
    }

    private List<CrossGroupTeamStats> CalculateGroupTable(TournamentGroup group, List<Country> allCountries)
    {
        var table = new List<CrossGroupTeamStats>();
        
        for (var i = 0; i < group.Standings.Count; i++)
        {
            var standing = group.Standings[i];
            
            var team = allCountries.First(c => c.Id == standing.TeamId);
            
            table.Add(new CrossGroupTeamStats
            {
                Team = team,
                OriginalGroupId = group.Name,
                OriginalRankInGroup = i + 1,
                Points = standing.Points,
                GoalDifference = standing.GoalDifference,
                GoalsScored = standing.GoalsFor,
                Wins = standing.Won,
                
                SeedOrFifaRank = team.DefaultRankingPoints 
            });
        }

        return table;
    }

    private List<CrossGroupTeamStats> SortCrossGroupTeams(
        List<CrossGroupTeamStats> teams, 
        List<CrossGroupTieBreaker> tieBreakers)
    {
        var ordered = tieBreakers.Select(tieBreaker => (Func<CrossGroupTeamStats, object>)(tieBreaker switch
            {
                CrossGroupTieBreaker.Points => t => t.Points,
                CrossGroupTieBreaker.GoalDifference => t => t.GoalDifference,
                CrossGroupTieBreaker.GoalsScored => t => t.GoalsScored,
                CrossGroupTieBreaker.Wins => t => t.Wins,
                CrossGroupTieBreaker.SeedOrFifaRank => t => -t.SeedOrFifaRank,
                _ => throw new ArgumentOutOfRangeException()
            }))
            .Aggregate<Func<CrossGroupTeamStats, object>, IOrderedEnumerable<CrossGroupTeamStats>?>(null, (current, keySelector) => current == null
                ? teams.OrderByDescending(keySelector)
                : current.ThenByDescending(keySelector));

        return ordered?.ToList() ?? teams;
    }
}