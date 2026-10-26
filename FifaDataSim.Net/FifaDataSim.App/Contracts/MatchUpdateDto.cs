namespace WorldCupSimulator.Contracts;

public class MatchUpdateDto
{
    public string HomeTeamId { get; set; } = string.Empty;
    public string AwayTeamId { get; set; } = string.Empty;
    public int HomeTeamGoals { get; set; }
    public int AwayTeamGoals { get; set; }
    public double Importance { get; set; }
}