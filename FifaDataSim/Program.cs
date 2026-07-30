using WorldCupSimulator.Application;
using WorldCupSimulator.Application.Evaluators;
using WorldCupSimulator.Application.PotSeeding;
using WorldCupSimulator.Application.Simulations;
using WorldCupSimulator.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<ICountryRepository, CountryRepository>();
builder.Services.AddSingleton<ISessionRepository, InMemorySessionRepository>();
builder.Services.AddSingleton<ITournamentService, TournamentService>();
builder.Services.AddSingleton<ISimulationEngine, SimulationEngine>();
builder.Services.AddSingleton<IPotSeedingService, PotSeedingService>();
builder.Services.AddSingleton<IPhaseEvaluatorFactory, PhaseEvaluatorFactory>();

builder.Services.AddTransient<GroupStagePhaseEvaluator>();
builder.Services.AddTransient<GroupPhaseRankingEvaluator>();
builder.Services.AddTransient<MultiKnockoutPhaseEvaluator>();
builder.Services.AddTransient<SingleKnockoutPhaseEvaluator>();

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();