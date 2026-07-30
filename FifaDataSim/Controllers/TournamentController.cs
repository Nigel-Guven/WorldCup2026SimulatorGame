using Microsoft.AspNetCore.Mvc;
using WorldCupSimulator.Application;
using WorldCupSimulator.Contracts;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TournamentController(
    ITournamentService tournamentService)
    : ControllerBase
{

    [HttpGet("draw-setup")]
    public ActionResult<TournamentDrawSetup> GetDrawSetup(
        [FromQuery] string tournamentCode, 
        [FromQuery] string? phaseId = null)
    {
        var setup = tournamentService.GetDrawSetup(tournamentCode, phaseId);
        if (setup == null) return NotFound("Tournament or Phase configuration not found.");

        return Ok(setup);
    }
    
    [HttpPost("initialize-phase")]
    public ActionResult<TournamentSession> InitializePhase([FromBody] PhaseInitializationRequest request)
    {
        var session = tournamentService.InitializePhase(request);
        if (session == null) return BadRequest("Failed to initialize phase. Check request payload.");

        return Ok(session);
    }

    [HttpGet("session/{sessionId:guid}")]
    public ActionResult<TournamentSession> GetSession(Guid sessionId)
    {
        var session = tournamentService.GetSession(sessionId);
        if (session == null) return NotFound("Session not found.");

        return Ok(session);
    }

    [HttpPost("sessions/{sessionId:guid}/phases/{phaseId}/simulate")]
    public ActionResult<TournamentSession> SimulatePhase(Guid sessionId, string phaseId)
    {
        var session = tournamentService.SimulatePhase(sessionId, phaseId);
        if (session == null) return NotFound("Session or Phase not found.");

        return Ok(session);
    }
    
    [HttpPost("sessions/{sessionId:guid}/fixtures/{fixtureId:guid}/simulate")]
    public ActionResult<FixtureSimulationResult> SimulateFixture(Guid sessionId, Guid fixtureId)
    {
        var result = tournamentService.SimulateFixture(sessionId, fixtureId);
        if (result == null) return NotFound("Fixture not found in active session.");

        return Ok(result);
    }
    
    [HttpPost("sessions/{sessionId:guid}/phases/{phaseId}/advance")]
    public ActionResult<PhaseAdvancementResult> AdvancePhase(Guid sessionId, string phaseId)
    {
        var result = tournamentService.AdvancePhase(sessionId, phaseId);
        if (result == null) return BadRequest("Phase cannot be advanced (matches may still be unplayed).");

        return Ok(result);
    }
}