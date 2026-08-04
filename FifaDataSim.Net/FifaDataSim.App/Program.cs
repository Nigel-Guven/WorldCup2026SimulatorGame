using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Application.PotSeeding;
using WorldCupSimulator.Application.Simulations;
using WorldCupSimulator.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

var dbPath = Path.Combine(builder.Environment.ContentRootPath, "worldcup.db");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddScoped<ICountryRepository, CountryRepository>();
builder.Services.AddSingleton<ISimulationEngine, SimulationEngine>();
builder.Services.AddSingleton<IPotSeedingService, PotSeedingService>();

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();


using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
    DbInitializer.Seed(context, env);
}

app.Run();