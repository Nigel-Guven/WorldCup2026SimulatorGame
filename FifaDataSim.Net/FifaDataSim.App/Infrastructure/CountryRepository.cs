using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Contracts;
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

    public IEnumerable<Country> GetTeamsByConfederation(Confederation confederation) =>
        _context.Countries
            .AsNoTracking()
            .Where(t => t.Confederation == confederation)
            .OrderByDescending(t => t.DefaultRankingPoints)
            .ToList();

    public Country? GetTeamById(string id) =>
        _context.Countries
            .FirstOrDefault(t => t.Id.ToLower() == id.ToLower());

    public void UpdateTeamStats(MatchUpdateDto matchUpdate)
    {
        var homeTeam = _context.Countries.FirstOrDefault(t => t.Id.ToLower() == matchUpdate.HomeTeamId.ToLower());
        var awayTeam = _context.Countries.FirstOrDefault(t => t.Id.ToLower() == matchUpdate.AwayTeamId.ToLower());

        if (homeTeam == null || awayTeam == null)
        {
            throw new KeyNotFoundException("One or both teams could not be found.");
        }
        
        double homeW, awayW;
        if (matchUpdate.HomeTeamGoals > matchUpdate.AwayTeamGoals)
        {
            homeW = 1.0;
            awayW = 0.0;
        }
        else if (matchUpdate.HomeTeamGoals < matchUpdate.AwayTeamGoals)
        {
            homeW = 0.0;
            awayW = 1.0;
        }
        else
        {
            homeW = 0.5;
            awayW = 0.5;
        }

        const double importance = 20.0;
        
        var homeDr = homeTeam.DefaultRankingPoints - awayTeam.DefaultRankingPoints;
        var awayDr = -homeDr;

        var homeWe = 1.0 / (Math.Pow(10.0, -homeDr / 600.0) + 1.0);
        var awayWe = 1.0 / (Math.Pow(10.0, -awayDr / 600.0) + 1.0);

        var homePointChange = importance * (homeW - homeWe);
        var awayPointChange = importance * (awayW - awayWe);

        homeTeam.DefaultRankingPoints = (int)Math.Round(homeTeam.DefaultRankingPoints + homePointChange);
        awayTeam.DefaultRankingPoints = (int)Math.Round(awayTeam.DefaultRankingPoints + awayPointChange);
        
        const double strengthFactor = 0.25; 
        var homeStrengthChange = strengthFactor * (homeW - homeWe);
        var awayStrengthChange = strengthFactor * (awayW - awayWe);

        homeTeam.Strength = (int) Math.Clamp(homeTeam.Strength + homeStrengthChange, 3, 95);
        awayTeam.Strength = (int) Math.Clamp(awayTeam.Strength + awayStrengthChange, 3, 95);

        _context.SaveChanges();
    }
}