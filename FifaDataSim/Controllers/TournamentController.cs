using Microsoft.AspNetCore.Mvc;
using WorldCupSimulator.Application;
using WorldCupSimulator.Contracts;
using WorldCupSimulator.Infrastructure;
using WorldCupSimulator.Models;
using WorldCupSimulator.Models.WorldCup48Format;

namespace WorldCupSimulator.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TournamentController(
    ICountryRepository countryRepository, 
    ITournamentService tournamentService,
    ISimulationEngine simEngine,
    IKnockoutBracketService bracketService)
    : ControllerBase
{
    [HttpGet("draw-setup")]
    public ActionResult<WorldCupDrawSetup> GetDrawSetup()
    {
        var allTeams = countryRepository.GetAllTeams().ToList();

        if (allTeams.Count < 48)
        {
            return BadRequest(new { message = $"Not enough teams to simulate a 48-team tournament. Found {allTeams.Count}." });
        }
        
        //Random 48
        var random = new Random();
        var qualifiedTeams = allTeams.OrderBy(_ => random.Next()).Take(48).ToList();
        
        //Top 48
        //var qualifiedTeams = allTeams.Take(48).ToList();
        
        //Bottom 48
        //var qualifiedTeams = allTeams.TakeLast(48).ToList();
        
        
        var sortedQualified = qualifiedTeams.OrderByDescending(t => t.DefaultRankingPoints).ToList();

        var setup = new WorldCupDrawSetup
        {
            Pot1 = sortedQualified.Skip(0).Take(12).ToList(),
            Pot2 = sortedQualified.Skip(12).Take(12).ToList(),
            Pot3 = sortedQualified.Skip(24).Take(12).ToList(),
            Pot4 = sortedQualified.Skip(36).Take(12).ToList()
        };

        return Ok(setup);
    }
    
    [HttpPost("initialize")]
    public ActionResult<TournamentSession> InitializeTournament([FromBody] List<GroupSetupDto> groups)
    {
        if (groups == null || groups.Count == 0)
        {
            return BadRequest("Invalid group configuration package.");
        }

        var session = tournamentService.CreateNewSession(groups);
        return Ok(session);
    }

    [HttpGet("current-session")]
    public ActionResult<TournamentSession> GetCurrentSession()
    {
        var session = tournamentService.GetCurrentSession();
        if (session == null) return NotFound("No active tournament running.");
        return Ok(session);
    }

    [HttpPut("fixtures/{id:guid}")]
    public ActionResult UpdateScore(Guid id, [FromBody] MatchScoreUpdate update)
    {
        tournamentService.UpdateFixtureScore(id, update.HomeScore, update.AwayScore);
        return Ok();
    }
    
    [HttpPost("fixtures/simulate-all")]
    public ActionResult<TournamentSession> SimulateAllUnplayedFixtures()
    {
        var session = tournamentService.GetCurrentSession();
        if (session == null) return NotFound("No active tournament running.");

        var unplayedFixtures = session.Fixtures.Where(f => !f.IsPlayed).ToList();

        foreach (var fixture in unplayedFixtures)
        {
            var (homeScore, awayScore) = simEngine.SimulateMatch(fixture.HomeTeam, fixture.AwayTeam);
            tournamentService.UpdateFixtureScore(fixture.Id, homeScore, awayScore);
        }

        return Ok(session);
    }

// POST: api/tournament/fixtures/{id}/simulate
    [HttpPost("fixtures/{id}/simulate")]
    public ActionResult<MatchFixture> SimulateSingleFixture(Guid id)
    {
        var session = tournamentService.GetCurrentSession();
        if (session == null) return NotFound("No active tournament running.");

        var fixture = session.Fixtures.FirstOrDefault(f => f.Id == id);
        if (fixture == null) return NotFound("Fixture not found.");

        if (!fixture.IsPlayed)
        {
            var (homeScore, awayScore) = simEngine.SimulateMatch(fixture.HomeTeam, fixture.AwayTeam);
            tournamentService.UpdateFixtureScore(fixture.Id, homeScore, awayScore);
        }

        return Ok(fixture);
    }

    public class MatchScoreUpdate
    {
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
    }
    
    [HttpGet("knockout/third-place-rankings")]
    public ActionResult<List<ThirdPlaceCandidate>> GetThirdPlaceRankings()
    {
        var session = tournamentService.GetCurrentSession();
        if (session == null) return NotFound("No active session.");

        return Ok( bracketService.GetTopEightThirdPlaceTeams(session));
    }

    [HttpPost("knockout/generate")]
    public ActionResult<KnockoutBracket> GenerateBracket()
    {
        var session = tournamentService.GetCurrentSession();
        if (session == null) return NotFound("No active session.");

        var bracket = bracketService.GenerateRoundOf32(session);
        session.KnockoutBracket = bracket;
        return Ok(bracket);
    }
    
    [HttpPost("knockout/simulate-match/{matchId}")]
    public ActionResult<KnockoutBracket> SimulateKnockoutMatch(Guid matchId)
    {
        var session = tournamentService.GetCurrentSession();
        if (session == null || session.KnockoutBracket == null) return NotFound("No active bracket.");

        var bracket = session.KnockoutBracket;
    
        // Find match in any round
        var allMatches = bracket.RoundOf32
            .Concat(bracket.RoundOf16)
            .Concat(bracket.QuarterFinals)
            .Concat(bracket.SemiFinals)
            .Concat(new[] { bracket.ThirdPlaceMatch, bracket.Final });

        var match = allMatches.FirstOrDefault(m => m.Id == matchId);
        if (match == null) return NotFound("Knockout match not found.");

        simEngine.SimulateKnockoutMatch(match);
        bracketService.AdvanceBracket(bracket);

        return Ok(bracket);
    }
}