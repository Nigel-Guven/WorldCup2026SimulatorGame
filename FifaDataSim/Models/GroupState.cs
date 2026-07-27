namespace WorldCupSimulator.Models;

public class GroupState
{
    public string Name { get; set; } = string.Empty;
    public List<GroupTeamStanding> Standings { get; set; } = [];
}