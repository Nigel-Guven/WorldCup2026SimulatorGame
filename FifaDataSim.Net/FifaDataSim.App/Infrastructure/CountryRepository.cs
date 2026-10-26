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

        const double strengthFactor = 2.0;
        
        var pointChange = matchUpdate.Importance * (homeW - homeWe);
        var strengthChange = strengthFactor * (homeW - homeWe);

        homeTeam.DefaultRankingPoints = (int)Math.Round(homeTeam.DefaultRankingPoints + pointChange);
        awayTeam.DefaultRankingPoints = (int)Math.Round(awayTeam.DefaultRankingPoints - pointChange);

        homeTeam.Strength = (int)Math.Clamp(Math.Round(homeTeam.Strength + strengthChange), 3, 95);
        awayTeam.Strength = (int)Math.Clamp(Math.Round(awayTeam.Strength - strengthChange), 3, 95);
        
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
        var dataFolder = Path.Combine(_env.ContentRootPath, "Data");
        if (!Directory.Exists(dataFolder))
            return;

        var jsonFiles = Directory.GetFiles(dataFolder, "*.json");
        var strengthMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        
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
    
    private static string AppendFormResult(string? currentForm, char result)
    {
        var newForm = (currentForm ?? string.Empty) + result;
        return newForm.Length > 5 ? newForm[^5..] : newForm;
    }
}