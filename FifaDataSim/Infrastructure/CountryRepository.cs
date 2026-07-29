using System.Text.Json;
using WorldCupSimulator.Models;
using WorldCupSimulator.Models.Countries;

namespace WorldCupSimulator.Infrastructure;

public class CountryRepository : ICountryRepository
{
    private readonly List<Country> _countries = [];

    public CountryRepository(IWebHostEnvironment env)
    {
        LoadTeamsFromJson(env);
    }

    private void LoadTeamsFromJson(IWebHostEnvironment env)
    {

        var dataFolder = Path.Combine(env.ContentRootPath, "Data");
        Console.WriteLine($"[CountryRepository] Looking for JSON files in: {dataFolder}");
        if (!Directory.Exists(dataFolder))
            return;

        var jsonFiles = Directory.GetFiles(dataFolder, "*.json");

        foreach (var file in jsonFiles)
        {
            try
            {
                var jsonString = File.ReadAllText(file);
                var teamsInFile = JsonSerializer.Deserialize<List<Country>>(jsonString);
                
                var ids = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                var shortNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                
                var errors = new List<string>();
                
                foreach (var team in teamsInFile)
                {
                    if (!ids.Add(team.Id))
                        errors.Add($"Duplicate id: {team.Id}");

                    if (!shortNames.Add(team.ShortName))
                        errors.Add($"Duplicate short name: {team.ShortName}");
                }
                
                if (errors.Any())
                {
                    Console.WriteLine($"Duplicate ids found: {string.Join(", ", errors)}");
                }
                
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

    public IEnumerable<Country> GetAllTeams() => _countries.OrderByDescending(t => t.DefaultRankingPoints);
    public IEnumerable<Country> GetAllTeamsNoOrdering() => _countries;

    public IEnumerable<Country> GetTeamsByConfederation(Confederation confederation) =>
        _countries.Where(t => t.Confederation.Equals(confederation)).OrderByDescending(t => t.DefaultRankingPoints);
    
    public IEnumerable<Country> GetTeamsByConfederationNoOrdering(Confederation confederation) =>
        _countries.Where(t => t.Confederation.Equals(confederation));

    public Country? GetTeamById(string id) =>
        _countries.FirstOrDefault(t => t.Id.Equals(id, StringComparison.OrdinalIgnoreCase));

    public void UpdateCountryForm(string countryId, string form)
    {
        var country = GetTeamById(countryId);
        country.Form = form;
        
    }
}