using WorldCupSimulator.Models;

namespace WorldCupSimulator.Contracts;

public abstract record GroupSetupDto
{
    public string Name { get; set; } = string.Empty;
    public List<Country> Teams { get; set; } = [];
}