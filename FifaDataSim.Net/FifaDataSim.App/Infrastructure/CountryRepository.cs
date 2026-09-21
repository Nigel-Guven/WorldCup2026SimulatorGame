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
        
        const double strengthFactor = 2.0; 
        
        var homeStrengthChange = strengthFactor * (homeW - homeWe);
        var awayStrengthChange = strengthFactor * (awayW - awayWe);
        
        homeTeam.Strength = (int)Math.Clamp(Math.Round(homeTeam.Strength + homeStrengthChange), 3, 95);
        awayTeam.Strength = (int)Math.Clamp(Math.Round(awayTeam.Strength + awayStrengthChange), 3, 95);

        _context.SaveChanges();
    }
    
    public void RefreshTeamStrength()
    {
        var dataFolder = Path.Combine(_env.ContentRootPath, "Data");
        if (!Directory.Exists(dataFolder))
            return;

        var jsonFiles = Directory.GetFiles(dataFolder, "*.json");
        var strengthMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        // 1. Read original Strength values from default JSON files
        foreach (var file in jsonFiles)
        {
            try
            {
                var jsonString = File.ReadAllText(file);
                var teamsInFile = JsonSerializer.Deserialize<List<Country>>(jsonString);

                if (teamsInFile == null) continue;

                foreach (var team in teamsInFile)
                {
                    if (!string.IsNullOrEmpty(team.Id))
                    {
                        strengthMap[team.Id] = team.Strength;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading file {file} during strength refresh: {ex.Message}");
            }
        }

        if (strengthMap.Count == 0)
            return;

        var dbTeams = _context.Countries.ToList();

        foreach (var team in dbTeams)
        {
            if (strengthMap.TryGetValue(team.Id, out int defaultStrength))
            {
                team.Strength = defaultStrength;
            }
        }

        _context.SaveChanges();
    }
}