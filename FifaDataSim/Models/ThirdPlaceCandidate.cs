namespace WorldCupSimulator.Models;

public class ThirdPlaceCandidate
{
    public string GroupName { get; set; } = string.Empty;
    public GroupTeamStanding Standing { get; set; } = null!;
    public Country Team { get; set; } = null!;
}