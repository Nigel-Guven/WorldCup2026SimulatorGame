namespace WorldCupSimulator.Models;

public class Fixture
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string HomeTeamId { get; set; } = string.Empty;
    public string AwayTeamId { get; set; } = string.Empty;
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public string Round { get; set; } = "Group Stage";
    public bool IsSimulated { get; set; }
}