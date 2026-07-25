using Microsoft.AspNetCore.Mvc;
using WorldCupSimulator.Infrastructure;
using WorldCupSimulator.Models;
using WorldCupSimulator.Models.Countries;

namespace WorldCupSimulator.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController(ICountryRepository repository) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Country>> GetAllTeams()
    {
        return Ok(repository.GetAllTeams());
    }
    
    [HttpGet("{id}")]
    public ActionResult<Country> GetTeamById(string id)
    {
        var team = repository.GetTeamById(id);
        if (team == null)
        {
            return NotFound(new { message = $"Team with ID '{id}' not found." });
        }
        
        return Ok(team);
    }

    [HttpGet("confederation/{confederation}")]
    public ActionResult<IEnumerable<Country>> GetTeamsByConfederation(Confederation confederation)
    {
        var teams = repository.GetTeamsByConfederation(confederation);
        return Ok(teams);
    }
}