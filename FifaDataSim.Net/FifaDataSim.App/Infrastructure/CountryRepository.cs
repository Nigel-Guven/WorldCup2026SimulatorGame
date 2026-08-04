using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Infrastructure;

public class CountryRepository : ICountryRepository
{
    private readonly AppDbContext _context;

    public CountryRepository(AppDbContext context)
    {
        _context = context;
    }

    public IEnumerable<Country> GetAllTeams() =>
        _context.Countries
            .AsNoTracking()
            .OrderByDescending(t => t.DefaultRankingPoints)
            .ToList();

    public IEnumerable<Country> GetAllTeamsNoOrdering() =>
        _context.Countries
            .AsNoTracking()
            .ToList();

    public IEnumerable<Country> GetTeamsByConfederation(Confederation confederation) =>
        _context.Countries
            .AsNoTracking()
            .Where(t => t.Confederation == confederation)
            .OrderByDescending(t => t.DefaultRankingPoints)
            .ToList();

    public IEnumerable<Country> GetTeamsByConfederationNoOrdering(Confederation confederation) =>
        _context.Countries
            .AsNoTracking()
            .Where(t => t.Confederation == confederation)
            .ToList();

    public Country? GetTeamById(string id) =>
        _context.Countries
            .FirstOrDefault(t => t.Id.ToLower() == id.ToLower());

    public void UpdateCountryForm(string countryId, string form)
    {
        var country = _context.Countries.FirstOrDefault(t => t.Id.ToLower() == countryId.ToLower());
        if (country != null)
        {
            country.Form = form;
            _context.SaveChanges();
        }
    }
}