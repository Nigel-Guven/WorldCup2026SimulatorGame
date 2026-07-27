using WorldCupSimulator.Models;
using WorldCupSimulator.Models.Countries;

namespace WorldCupSimulator.Infrastructure;

public interface ICountryRepository
{
    IEnumerable<Country> GetAllTeams();
    IEnumerable<Country> GetAllTeamsNoOrdering();
    IEnumerable<Country> GetTeamsByConfederation(Confederation confederation);
    IEnumerable<Country> GetTeamsByConfederationNoOrdering(Confederation confederation);
    Country? GetTeamById(string id);
}