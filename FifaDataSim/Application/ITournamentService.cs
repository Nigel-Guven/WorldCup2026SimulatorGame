using WorldCupSimulator.Contracts;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application;

public interface ITournamentService
{
    TournamentDrawSetup? GetDrawSetup(string tournamentCode, string? phaseId);
    TournamentSession? InitializePhase(PhaseInitializationRequest request);
    TournamentSession? GetSession(Guid sessionId);
    TournamentSession? SimulatePhase(Guid sessionId, string phaseId); 
    FixtureSimulationResult? SimulateFixture(Guid sessionId, Guid fixtureId);
    PhaseAdvancementResult? AdvancePhase(Guid sessionId, string phaseId); 
}