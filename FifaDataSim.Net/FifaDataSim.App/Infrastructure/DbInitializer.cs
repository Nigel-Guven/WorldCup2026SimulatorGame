using System.Text.Json;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Infrastructure;

public static class DbInitializer
{
    public static void Seed(AppDbContext context, IWebHostEnvironment env)
    {
        context.Database.EnsureCreated();

        if (context.Countries.Any())
            return;

        var dataFolder = Path.Combine(env.ContentRootPath, "Data");
        if (!Directory.Exists(dataFolder))
            return;

        var jsonFiles = Directory.GetFiles(dataFolder, "*.json");
        var globalIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var globalShortNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var file in jsonFiles)
        {
            try
            {
                var jsonString = File.ReadAllText(file);
                var teamsInFile = JsonSerializer.Deserialize<List<Country>>(jsonString);

                if (teamsInFile == null) continue;

                var validTeams = new List<Country>();

                foreach (var team in teamsInFile)
                {
                    bool isValid = true;
                    if (!globalIds.Add(team.Id))
                    {
                        Console.WriteLine($"[Seeder Error] Duplicate id found in {file}: {team.Id}");
                        isValid = false;
                    }

                    if (!globalShortNames.Add(team.ShortName))
                    {
                        Console.WriteLine($"[Seeder Error] Duplicate short name found in {file}: {team.ShortName}");
                        isValid = false;
                    }

                    if (isValid)
                    {
                        validTeams.Add(team);
                    }
                }

                context.Countries.AddRange(validTeams);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading file {file}: {ex.Message}");
            }
        }

        context.SaveChanges();
    }
}