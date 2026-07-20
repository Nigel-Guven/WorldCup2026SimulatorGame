using WorldCupSimulator.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<ICountryRepository, CountryRepository>();

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();