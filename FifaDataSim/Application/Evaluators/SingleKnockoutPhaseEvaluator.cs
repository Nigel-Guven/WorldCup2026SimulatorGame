using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application.Evaluators;

public class SingleKnockoutPhaseEvaluator : IPhaseEvaluator
{
    public List<TeamRanking> CalculateRankings(PhaseState phaseState)
    {
        if (phaseState is not SingleKnockoutPhaseState singleState)
            throw new ArgumentException("Phase state mismatch. Expected SingleKnockoutPhaseState.");

        var rankings = new List<TeamRanking>();
        
        var teams = singleState.Fixtures
            .SelectMany(f => new[] { f.HomeTeam, f.AwayTeam }) // Fixed implicit array typing
            .Where(t => t != null)
            .DistinctBy(t => t.Id)
            .ToList();

        var teamProgress = teams.Select(team => 
            {
                var teamMatches = singleState.Fixtures.Where(f => f.IsPlayed && (f.HomeTeam.Id == team.Id || f.AwayTeam.Id == team.Id)).ToList();
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
            rankings.Add(new TeamRanking(teamProgress[i].Team, i + 1, "MAIN_BRACKET")); 
        }

        return rankings;
    }
}