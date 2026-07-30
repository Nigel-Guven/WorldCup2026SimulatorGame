using WorldCupSimulator.Models;

namespace WorldCupSimulator.Contracts;

public class PhaseAdvancementResult
{
    public string PhaseId { get; init; } = string.Empty;
    public string PhaseName { get; init; } = string.Empty;
    public List<Country> FinalsQualified { get; init; } = [];
    public List<Country> Eliminated { get; init; } = [];
    public Dictionary<string, List<Country>> RoutedToPhases { get; init; } = [];
    public List<string> NextReadyPhases { get; init; } = [];
}