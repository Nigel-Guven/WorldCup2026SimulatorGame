namespace WorldCupSimulator.Models;

public class MatchFixture
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string GroupName { get; set; } = string.Empty;
    public int Matchday { get; set; } 
    public Country HomeTeam { get; set; } = null!;
    public Country AwayTeam { get; set; } = null!;
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public bool IsPlayed { get; set; }
}