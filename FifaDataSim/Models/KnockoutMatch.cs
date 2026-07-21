namespace WorldCupSimulator.Models;

public class KnockoutMatch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Stage { get; set; } = string.Empty; // "R32", "R16", "QF", "SF", "Final"
    public int MatchNumber { get; set; }
    
    public Country? HomeTeam { get; set; }
    public Country? AwayTeam { get; set; }
    
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public bool WentToExtraTime { get; set; }
    public int? HomeExtraTimeScore { get; set; }
    public int? AwayExtraTimeScore { get; set; }
    public bool WentToPenalties { get; set; }
    public int? HomePenaltyScore { get; set; }
    public int? AwayPenaltyScore { get; set; }
    
    public Country? Winner { get; set; }
    public bool IsPlayed => Winner != null;
}