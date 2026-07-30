using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Models;

public class TournamentDrawSetup
{
    public required string TournamentCode { get; init; }
    public required string TournamentName { get; init; }
    public string PhaseId { get; set; }
    public PhaseType PhaseType { get; set; }
    public List<Pot> Pots { get; set; }
}