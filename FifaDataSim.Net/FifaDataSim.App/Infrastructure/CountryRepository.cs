using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Contracts;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Infrastructure;

public class CountryRepository : ICountryRepository
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public CountryRepository(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    public IEnumerable<Country> GetAllTeams() =>
        _context.Countries
            .AsNoTracking()
            .OrderByDescending(t => t.DefaultRankingPoints)
            .ToList();

    public IEnumerable<Country> GetTeamsByConfederation(Confederation confederation) =>
        _context.Countries
            .AsNoTracking()
            .Where(t => t.Confederation == confederation)
            .OrderByDescending(t => t.DefaultRankingPoints)
            .ToList();

    public Country? GetTeamById(string id) =>
        _context.Countries
            .FirstOrDefault(t => t.Id.ToLower() == id.ToLower());

    public async Task UpdateTeamStatsAsync(MatchUpdateDto matchUpdate)
    {
        var homeId = matchUpdate.HomeTeamId.ToLower();
        var awayId = matchUpdate.AwayTeamId.ToLower();

        var teams = await _context.Countries
            .Where(t => t.Id.ToLower() == homeId || t.Id.ToLower() == awayId)
            .ToListAsync();

        var homeTeam = teams.FirstOrDefault(t => t.Id.ToLower() == homeId);
        var awayTeam = teams.FirstOrDefault(t => t.Id.ToLower() == awayId);

        if (homeTeam == null || awayTeam == null)
        {
            throw new KeyNotFoundException("One or both teams could not be found.");
        }

        var homeW = matchUpdate.HomeTeamGoals > matchUpdate.AwayTeamGoals ? 1.0 :
            matchUpdate.HomeTeamGoals < matchUpdate.AwayTeamGoals ? 0.0 : 0.5;

        var homeDr = homeTeam.DefaultRankingPoints - awayTeam.DefaultRankingPoints;
        var homeWe = 1.0 / (Math.Pow(10.0, -homeDr / 600.0) + 1.0);

        const double strengthFactor = 1.5;
        
        var pointChange = matchUpdate.Importance * (homeW - homeWe);
        var strengthChange = strengthFactor * (homeW - homeWe);

        homeTeam.DefaultRankingPoints = (int)Math.Round(homeTeam.DefaultRankingPoints + pointChange);
        awayTeam.DefaultRankingPoints = (int)Math.Round(awayTeam.DefaultRankingPoints - pointChange);

        homeTeam.StrengthAttack = (int)Math.Clamp(Math.Round(homeTeam.StrengthAttack + strengthChange), 1, 100);
        awayTeam.StrengthAttack = (int)Math.Clamp(Math.Round(awayTeam.StrengthAttack - strengthChange), 1, 100);
        
        homeTeam.StrengthDefence = (int)Math.Clamp(Math.Round(homeTeam.StrengthDefence + strengthChange), 1, 100);
        awayTeam.StrengthDefence = (int)Math.Clamp(Math.Round(awayTeam.StrengthDefence - strengthChange), 1, 100);
        
        char homeResult;
        char awayResult;

        if (matchUpdate.HomeTeamGoals > matchUpdate.AwayTeamGoals)
        {
            homeResult = 'W';
            awayResult = 'L';
        }
        else if (matchUpdate.HomeTeamGoals < matchUpdate.AwayTeamGoals)
        {
            homeResult = 'L';
            awayResult = 'W';
        }
        else
        {
            homeResult = 'D';
            awayResult = 'D';
        }

        homeTeam.Form = AppendFormResult(homeTeam.Form, homeResult);
        awayTeam.Form = AppendFormResult(awayTeam.Form, awayResult);

        await _context.SaveChangesAsync();
    }

    public void RefreshTeamStrength()
    {
        throw new NotImplementedException();
    }

    private static string AppendFormResult(string? currentForm, char result)
    {
        var newForm = (currentForm ?? string.Empty) + result;
        return newForm.Length > 5 ? newForm[^5..] : newForm;
    }
}