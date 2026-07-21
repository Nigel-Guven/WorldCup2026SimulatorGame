namespace WorldCupSimulator.Models;

public class GroupState
{
    public string Name { get; set; } = string.Empty; // "A" through "L"
    public List<GroupTeamStanding> Standings { get; set; } = [];
}