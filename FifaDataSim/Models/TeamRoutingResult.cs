namespace WorldCupSimulator.Models;

public enum RoutingStatus
{
    Advanced,
    Eliminated,
    Pending
}

public class TeamRoutingResult
{
    public required Country Team { get; init; }
    public RoutingStatus Status { get; init; }
    
    public string? TargetPhaseId { get; init; }

    public string? TargetGroupOrPathId { get; init; }

    public string? QualificationMethod { get; init; }
}