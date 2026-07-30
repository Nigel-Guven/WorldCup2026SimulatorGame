namespace WorldCupSimulator.Models;

public class KnockoutPath
{
    public required string Id { get; init; }
    public required string PathName { get; init; }
    public List<Country> Teams { get; set; } = [];
}