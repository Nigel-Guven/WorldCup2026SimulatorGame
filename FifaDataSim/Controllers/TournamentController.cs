using Microsoft.AspNetCore.Mvc;
using WorldCupSimulator.Application;
using WorldCupSimulator.Application.PotSeeding;
using WorldCupSimulator.Application.Simulations;
using WorldCupSimulator.Contracts;
using WorldCupSimulator.Infrastructure;
using WorldCupSimulator.Models;
using WorldCupSimulator.Models.Countries;
using WorldCupSimulator.Models.TournamentConfigurations;

namespace WorldCupSimulator.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TournamentController(
    ICountryRepository countryRepository, 
    ITournamentService tournamentService,
    ISimulationEngine simEngine,
    IKnockoutBracketService bracketService,
    IPotSeedingService potSeedingService)
    : ControllerBase
{
    [HttpGet("draw-setup")]
    public ActionResult<TournamentDrawSetup> GetDrawSetup([FromQuery] string? tournamentCode)
    {
        var config = TournamentFactory.GetByCode(tournamentCode) ?? TournamentFactory.WorldCup2026;
        
        var allTeams = countryRepository.GetTeamsByConfederation(Confederation.OFC).ToList();
        
        var pots = potSeedingService.GeneratePots(allTeams, config);

        var setup = new TournamentDrawSetup
        {
            TournamentCode = config.Code,
            TournamentName = config.Name,
            TotalTeams = config.TotalTeams,
            Pots = pots
        };

        return Ok(setup);
    }
    
    [HttpPost("initialize")]
    public ActionResult<TournamentSession> InitializeTournament([FromBody] List<GroupSetupDto>? groups)
    {
        if (groups == null || groups.Count == 0)
        {
            return BadRequest("Invalid group configuration package.");
        }

        var session = tournamentService.CreateNewSession(groups, true);
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
        var session = tournamentService.GetCurrentSession();
        if (session == null) return NotFound("No active tournament running.");

        tournamentService.UpdateFixtureScore(id, update.HomeScore, update.AwayScore);
        return Ok(session);
    }
    
    [HttpPost("fixtures/simulate-all")]
    public ActionResult<TournamentSession> SimulateAllUnplayedFixtures()
    {
        var session = tournamentService.GetCurrentSession();
        if (session == null) return NotFound("No active tournament running.");

        var unplayedFixtures = session.Fixtures.Where(f => !f.IsPlayed).ToList();

        foreach (var fixture in unplayedFixtures)
        {
            if (fixture.HomeTeam == null || fixture.AwayTeam == null)
            {
                fixture.IsPlayed = true;
                continue;
            }

            var (homeScore, awayScore) = simEngine.SimulateMatch(fixture.HomeTeam, fixture.AwayTeam);
            tournamentService.UpdateFixtureScore(fixture.Id, homeScore, awayScore);
        }

        return Ok(session);
    }

    [HttpPost("fixtures/{id:guid}/simulate")]
    public ActionResult<MatchFixture> SimulateSingleFixture(Guid id)
    {
        var session = tournamentService.GetCurrentSession();
        if (session == null) return NotFound("No active tournament running.");

        var fixture = session.Fixtures.FirstOrDefault(f => f.Id == id);
        if (fixture == null) return NotFound("Fixture not found.");

        if (fixture.IsPlayed) return Ok(session);

        if (fixture.HomeTeam == null || fixture.AwayTeam == null)
        {
            fixture.IsPlayed = true;
            return Ok(session);
        }

        var (homeScore, awayScore) = simEngine.SimulateMatch(fixture.HomeTeam, fixture.AwayTeam);
        tournamentService.UpdateFixtureScore(fixture.Id, homeScore, awayScore);

        return Ok(session);
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
        if (session?.KnockoutBracket == null) return NotFound("No active bracket.");

        var bracket = session.KnockoutBracket;

        var allMatches = bracket.RoundOf32
            .Concat(bracket.RoundOf16)
            .Concat(bracket.QuarterFinals)
            .Concat(bracket.SemiFinals)
            .Concat([bracket.ThirdPlaceMatch, bracket.Final]);

        var match = allMatches.FirstOrDefault(m => m.Id == matchId);
        if (match == null) return NotFound("Knockout match not found.");

        simEngine.SimulateKnockoutMatch(match);
        bracketService.AdvanceBracket(bracket);

        return Ok(bracket);
    }
    
    private List<Country> SelectQualifiedTeams(List<Country> allTeams, TournamentConfiguration config)
    {
        var random = Random.Shared;
        var qualifiedTeams = new List<Country>();
        
        if (config.ConfederationSlots is { Count: > 0 } slots)
        {
            foreach (var (confed, slotCount) in slots)
            {
                var confedTeams = allTeams
                    .Where(c => c.Confederation == confed)
                    .OrderBy(_ => random.Next()) 
                    .Take(slotCount)
                    .ToList();

                qualifiedTeams.AddRange(confedTeams);
            }
        }
        else
        {
            qualifiedTeams = allTeams
                .OrderByDescending(t => t.DefaultRankingPoints)
                .Take(config.TotalTeams)
                .ToList();
        }

        if (qualifiedTeams.Count < config.TotalTeams)
        {
            throw new InvalidOperationException(
                $"Configuration required {config.TotalTeams} teams, but only {qualifiedTeams.Count} were qualified."
            );
        }

        return qualifiedTeams;
    }
}