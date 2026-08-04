namespace WorldCupSimulator.Application;

public interface ITournamentProgressionService
{
    Task AdvanceQualifiedTeamsAsync(Guid completedPhaseId);
}