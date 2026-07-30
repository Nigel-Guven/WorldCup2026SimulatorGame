using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application.Evaluators;

public class MultiKnockoutPhaseEvaluator : IPhaseEvaluator
{
    public List<TeamRanking> CalculateRankings(PhaseState phaseState)
    {
        if (phaseState is not MultiKnockoutPhaseState multiState)
            throw new ArgumentException("Phase state mismatch. Expected MultiKnockoutPhaseState.");

        var rankings = new List<TeamRanking>();

        foreach (var path in multiState.Paths)
        {
            var pathFixtures = multiState.Fixtures
                .Where(f => f.GroupName == path.PathName && f.IsPlayed)
                .ToList();

            var teamProgress = path.Teams.Select(team => 
                {
                    var teamMatches = pathFixtures.Where(f => f.HomeTeam.Id == team.Id || f.AwayTeam.Id == team.Id).ToList();
                    var maxMatchDay = teamMatches.Count > 0 ? teamMatches.Max(m => m.Matchday) : 0;
                
                    var finalMatch = teamMatches.FirstOrDefault(m => m.Matchday == maxMatchDay);
                
                    // Corrected to use the entity method signature
                    var wonFinalMatch = finalMatch != null && finalMatch.IsWinner(team.Id);

                    return new { Team = team, MaxMatchday = maxMatchDay, WonFinalMatch = wonFinalMatch };
                })
                .OrderByDescending(t => t.MaxMatchday)
                .ThenByDescending(t => t.WonFinalMatch)
                .ToList();

            for (var i = 0; i < teamProgress.Count; i++)
            {
                rankings.Add(new TeamRanking(teamProgress[i].Team, i + 1, path.PathName));
            }
        }

        return rankings;
    }
}