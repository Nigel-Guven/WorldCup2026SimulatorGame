using WorldCupSimulator.Models;

namespace WorldCupSimulator.Infrastructure;

public interface ICountryRepository
{
    IEnumerable<Country> GetAllTeams();
    IEnumerable<Country> GetTeamsByConfederation(string confederation);
    Country? GetTeamById(string id);
}