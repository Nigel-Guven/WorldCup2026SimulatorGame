namespace WorldCupSimulator.Models.TournamentConfigurations.Phase;

public class CombinationMatrixConfig
{
    // Maps combination key (e.g., "ABCD") to a dictionary of [Target Match Slot Id] -> [Group Code Origin]
    // Example: "ABCD" -> { "R16_MATCH_1": "A", "R16_MATCH_2": "D", "R16_MATCH_3": "B", "R16_MATCH_4": "C" }
    public Dictionary<string, Dictionary<string, string>> CombinationMappings { get; init; } = [];
}