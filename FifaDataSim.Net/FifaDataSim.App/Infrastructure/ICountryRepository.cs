using WorldCupSimulator.Contracts;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Infrastructure;

public interface ICountryRepository
{
    IEnumerable<Country> GetAllTeams();
    IEnumerable<Country> GetTeamsByConfederation(Confederation confederation);
    Country? GetTeamById(string id);
    Task UpdateTeamStatsAsync(MatchUpdateDto matchUpdate);
    void RefreshTeamStrength();

}