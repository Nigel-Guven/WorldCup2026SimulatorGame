using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Models.TournamentConfigurations.Rules;

public class CrossGroupProgressionRule
{
    public int GroupPosition { get; init; } 

    public int StartRank { get; init; } 
    public int EndRank { get; init; }
    
    public string TargetPhaseId { get; init; }

    public List<CrossGroupTieBreaker> TieBreakers { get; init; } = [
        CrossGroupTieBreaker.Points,
        CrossGroupTieBreaker.GoalDifference,
        CrossGroupTieBreaker.GoalsScored,
        CrossGroupTieBreaker.Wins,
        CrossGroupTieBreaker.SeedOrFifaRank
    ];
    
    public bool ExcludeResultsAgainstLowestRankedTeam { get; init; } = false;
}