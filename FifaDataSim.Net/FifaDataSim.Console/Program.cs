using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Application.PotSeeding;
using WorldCupSimulator.Application.Simulations;
using WorldCupSimulator.Infrastructure;
using WorldCupSimulator.Models;
using FifaDataSim.Console;

class Program
{
    static async Task Main(string[] args)
    {
        // 1. Set up the Dependency Injection Host for Console
        var host = Host.CreateDefaultBuilder(args)
            .ConfigureServices((context, services) =>
            {
                var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "worldcup.db");

                services.AddDbContext<AppDbContext>(options =>
                    options.UseSqlite($"Data Source={dbPath}"));

                // Register Repositories and Services
                services.AddScoped<ICountryRepository, CountryRepository>();
                services.AddSingleton<IPotSeedingService, PotSeedingService>();
                services.AddSingleton<ISimulationEngine, SimulationEngine>();
                services.AddTransient<ConsoleSimulationRunner>();
                services.AddSingleton<TourneyFactory>();
            })
            .Build();

        // 2. Initialize and Seed the SQLite Database
        using (var scope = host.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            try
            {
                var context = services.GetRequiredService<AppDbContext>();
                
                // Ensure database is created/migrated
                context.Database.EnsureCreated();
                
                // If your DbInitializer expects a path or specific seeding signature, pass it here.
                // e.g., DbInitializer.Seed(context, Directory.GetCurrentDirectory());
                Console.WriteLine("[System] Database initialized and verified successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] An error occurred while seeding the database: {ex.Message}");
                return;
            }
        }

        // 3. Execute the Interactive Tournament Simulation
        using (var scope = host.Services.CreateScope())
        {
            var countryRepo = scope.ServiceProvider.GetRequiredService<ICountryRepository>();
            var runner = scope.ServiceProvider.GetRequiredService<ConsoleSimulationRunner>();
            var tourneyFactory = scope.ServiceProvider.GetRequiredService<TourneyFactory>();

            var tournamentConfig = tourneyFactory.GetHardcodedTournamentConfig();

            Console.WriteLine($"\n================================================");
            Console.WriteLine($"   STARTING TOURNAMENT: {tournamentConfig.TournamentName}");
            Console.WriteLine($"================================================");

            foreach (var confConfig in tournamentConfig.Confederations)
            {
                if (Enum.TryParse<Confederation>(confConfig.Id, true, out var confEnum))
                {
                    var teams = countryRepo.GetTeamsByConfederation(confEnum).ToList();

                    if (!teams.Any())
                    {
                        Console.WriteLine($"[Warning] No teams found in repository for confederation: {confConfig.Id}");
                        continue;
                    }

                    await runner.RunConfederationAsync(confConfig, teams);
                }
                else
                {
                    Console.WriteLine($"[Error] Could not parse Confederation string '{confConfig.Id}' to Enum.");
                }
            }
        }

        Console.WriteLine("\n================================================");
        Console.WriteLine("   All Qualifications Completed Successfully!   ");
        Console.WriteLine("================================================");
        Console.WriteLine("Press any key to exit.");
        Console.ReadKey();
    }
}