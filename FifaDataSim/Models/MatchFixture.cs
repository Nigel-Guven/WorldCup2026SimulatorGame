namespace WorldCupSimulator.Models;

public class MatchFixture
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PhaseId { get; set; } = string.Empty;
    public string GroupName { get; set; } = string.Empty; 
    public int Matchday { get; set; } 
    public Country HomeTeam { get; set; } = null!;
    public Country AwayTeam { get; set; } = null!;
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public bool WentToExtraTime { get; set; }
    public int? HomeExtraTimeScore { get; set; }
    public int? AwayExtraTimeScore { get; set; }
    public bool WentToPenalties { get; set; }
    public int? HomePenaltyScore { get; set; }
    public int? AwayPenaltyScore { get; set; }
    
    public bool IsPlayed { get; set; }
    
    public bool IsWinner(string teamId)
    {
        if (!IsPlayed || (HomeTeam.Id != teamId && AwayTeam.Id != teamId)) return false;

        var isHome = HomeTeam.Id == teamId;

        if (WentToPenalties)
            return isHome ? HomePenaltyScore > AwayPenaltyScore : AwayPenaltyScore > HomePenaltyScore;

        if (WentToExtraTime && HomeExtraTimeScore != AwayExtraTimeScore)
            return isHome ? HomeExtraTimeScore > AwayExtraTimeScore : AwayExtraTimeScore > HomeExtraTimeScore;

        return isHome ? HomeScore > AwayScore : AwayScore > HomeScore;
    }
}