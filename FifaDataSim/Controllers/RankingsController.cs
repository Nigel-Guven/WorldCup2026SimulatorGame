using Microsoft.AspNetCore.Mvc;
using WorldCupSimulator.Infrastructure;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController(ICountryRepository repository) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Country>> GetTeams([FromQuery] string? confederation = null)
    {
        return Ok(!string.IsNullOrEmpty(confederation) ? repository.GetTeamsByConfederation(confederation) : repository.GetAllTeams());
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
}