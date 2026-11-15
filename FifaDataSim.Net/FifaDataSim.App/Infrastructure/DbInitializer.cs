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
                
                var isRecognised = !Path.GetFileName(file)
                    .StartsWith("unrecognised_", StringComparison.OrdinalIgnoreCase);

                var validTeams = new List<Country>();

                foreach (var team in teamsInFile)
                {
                    var isValid = true;
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
                        team.IsOfficial = isRecognised;
                        team.HomeAdvantage = SetHomeAdvantage(team);
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

    private static double SetHomeAdvantage(Country team)
    {
        return team.ShortName switch
        {
            "SEI" or "KSH" or "CHG" or "ALK" or "NNV" or "STG" or "AMZ" or "FUG" or "ANT" or "JNM" => 1.45,
            "BOL" or "ECU" or "COL" or "MEX" or "SKK" or "UYG" or "KAM" or "CHK" or "CUZ" or "MPC" or "KER" or "CRZ" => 1.35,
            "TUR" or "GRE" or "SRB" or "SCO" or "JPN" or "MAR" or "BUR" or "TIB" or "ACR" or "AQU" or "PTC" => 1.25,
            "GEO" or "IRQ" or "NGA" or "RWA" or "KEN" or "ISL" or "ANM" or "PRI" or "GRL" or "YUK" or "KRL" => 1.21,
            "GHA" or "ISR" or "ARM" or "NOR" or "SAP" or "ADE" or "TEX" or "YUC" or "TYR" or "NFK" or "SRP" or "OSS" => 1.18,
            _ => 1.12
        };
    }
}