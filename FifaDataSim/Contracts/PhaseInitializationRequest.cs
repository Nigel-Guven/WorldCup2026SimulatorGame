namespace WorldCupSimulator.Contracts;

public class PhaseInitializationRequest
{
    public string TournamentCode { get; set; }
    public string PhaseId { get; set; }
    public Guid? SessionId { get; set; }
    public List<GroupSetupDto> DrawResults { get; set; } 
}