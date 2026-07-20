using System.Text.Json;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Infrastructure;

public class CountryRepository : ICountryRepository
{
    private readonly List<Country> _countries = new();

    public CountryRepository(IWebHostEnvironment env)
    {
        LoadTeamsFromJson(env);
    }

    private void LoadTeamsFromJson(IWebHostEnvironment env)
    {

        var dataFolder = Path.Combine(env.ContentRootPath, "Data");
        
        if (!Directory.Exists(dataFolder))
            return;

        var jsonFiles = Directory.GetFiles(dataFolder, "*.json");

        foreach (var file in jsonFiles)
        {
            try
            {
                var jsonString = File.ReadAllText(file);
                var teamsInFile = JsonSerializer.Deserialize<List<Country>>(jsonString);
                
                if (teamsInFile != null)
                {
                    _countries.AddRange(teamsInFile);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading file {file}: {ex.Message}");
            }
        }
    }

    public IEnumerable<Country> GetAllTeams() => _countries;

    public IEnumerable<Country> GetTeamsByConfederation(string confederation) =>
        _countries.Where(t => t.Confederation.ToString().Equals(confederation));

    public Country? GetTeamById(string id) =>
        _countries.FirstOrDefault(t => t.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
}