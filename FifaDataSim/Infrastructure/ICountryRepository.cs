using WorldCupSimulator.Models;
using WorldCupSimulator.Models.Countries;

namespace WorldCupSimulator.Infrastructure;

public interface ICountryRepository
{
    IEnumerable<Country> GetAllTeams();
    IEnumerable<Country> GetTeamsByConfederation(Confederation confederation);
    Country? GetTeamById(string id);
}