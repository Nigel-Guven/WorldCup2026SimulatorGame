using WorldCupSimulator.Contracts;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Infrastructure;

public interface ICountryRepository
{
    IEnumerable<Country> GetAllTeams();
    IEnumerable<Country> GetTeamsByConfederation(Confederation confederation);
    Country? GetTeamById(string id);
    void UpdateTeamStats(MatchUpdateDto matchUpdate);

}