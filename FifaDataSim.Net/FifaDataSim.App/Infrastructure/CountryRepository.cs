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
            throw new KeyNotFoundException(
                "One or both teams could not be found.");
        }

        if (matchUpdate.HomeTeamGoals < 0 ||
            matchUpdate.AwayTeamGoals < 0)
        {
            throw new ArgumentException("Goals cannot be negative.");
        }

        // -----------------------------------------
        // 1. Calculate FIFA ranking points
        // -----------------------------------------

        var homeW =
            matchUpdate.HomeTeamGoals > matchUpdate.AwayTeamGoals ? 1.0 :
            matchUpdate.HomeTeamGoals < matchUpdate.AwayTeamGoals ? 0.0 : 0.5;

        var homeDr =
            homeTeam.DefaultRankingPoints -
            awayTeam.DefaultRankingPoints;

        var homeWe =
            1.0 / (Math.Pow(10.0, -homeDr / 600.0) + 1.0);

        var pointChange =
            matchUpdate.Importance * (homeW - homeWe);

        homeTeam.DefaultRankingPoints =
            (int)Math.Round(homeTeam.DefaultRankingPoints + pointChange);

        awayTeam.DefaultRankingPoints =
            (int)Math.Round(awayTeam.DefaultRankingPoints - pointChange);


        // -----------------------------------------
        // 2. Calculate expected goals
        // -----------------------------------------

        const double BASE_HOME_GOALS = 1.35;
        const double BASE_AWAY_GOALS = 1.05;
        const double STRENGTH_SENSITIVITY = 0.012;

        const double DEFAULT_HOME_ADVANTAGE = 1.12;
        const double MAX_HOME_ADVANTAGE = 1.45;

        var homeAdvantage = matchUpdate.NeutralVenue
            ? 1.0
            : Math.Clamp(
                homeTeam.HomeAdvantage > 0
                    ? homeTeam.HomeAdvantage
                    : DEFAULT_HOME_ADVANTAGE,
                DEFAULT_HOME_ADVANTAGE,
                MAX_HOME_ADVANTAGE
            );

        var homeStrengthDifference =
            homeTeam.StrengthAttack - awayTeam.StrengthDefence;

        var awayStrengthDifference =
            awayTeam.StrengthAttack - homeTeam.StrengthDefence;

        var homeStrengthFactor = Math.Exp(
            homeStrengthDifference * STRENGTH_SENSITIVITY);

        var awayStrengthFactor = Math.Exp(
            awayStrengthDifference * STRENGTH_SENSITIVITY);

        var expectedHomeGoals =
            BASE_HOME_GOALS * homeAdvantage * homeStrengthFactor;

        var expectedAwayGoals =
            BASE_AWAY_GOALS * awayStrengthFactor;

        expectedHomeGoals = Math.Clamp(
            expectedHomeGoals, 0.08, 4.5);

        expectedAwayGoals = Math.Clamp(
            expectedAwayGoals, 0.08, 4.5);


        // -----------------------------------------
        // 3. Update attacking and defensive strength
        // -----------------------------------------

        const double STRENGTH_ADJUSTMENT_FACTOR = 0.8;
        const double MAX_STRENGTH_CHANGE = 1.5;

        // Attack: actual goals compared with expected goals
        var homeAttackChange =
            (matchUpdate.HomeTeamGoals - expectedHomeGoals)
            * STRENGTH_ADJUSTMENT_FACTOR;

        var awayAttackChange =
            (matchUpdate.AwayTeamGoals - expectedAwayGoals)
            * STRENGTH_ADJUSTMENT_FACTOR;

        // Defence: expected goals conceded compared with actual goals conceded
        var homeDefenceChange =
            (expectedAwayGoals - matchUpdate.AwayTeamGoals)
            * STRENGTH_ADJUSTMENT_FACTOR;

        var awayDefenceChange =
            (expectedHomeGoals - matchUpdate.HomeTeamGoals)
            * STRENGTH_ADJUSTMENT_FACTOR;

        // Prevent excessive changes in individual matches
        homeAttackChange = Math.Clamp(
            homeAttackChange,
            -MAX_STRENGTH_CHANGE,
            MAX_STRENGTH_CHANGE);

        awayAttackChange = Math.Clamp(
            awayAttackChange,
            -MAX_STRENGTH_CHANGE,
            MAX_STRENGTH_CHANGE);

        homeDefenceChange = Math.Clamp(
            homeDefenceChange,
            -MAX_STRENGTH_CHANGE,
            MAX_STRENGTH_CHANGE);

        awayDefenceChange = Math.Clamp(
            awayDefenceChange,
            -MAX_STRENGTH_CHANGE,
            MAX_STRENGTH_CHANGE);

        // Apply changes independently
        homeTeam.StrengthAttack = (int)Math.Clamp(
            Math.Round(homeTeam.StrengthAttack + homeAttackChange),
            1, 100);

        awayTeam.StrengthAttack = (int)Math.Clamp(
            Math.Round(awayTeam.StrengthAttack + awayAttackChange),
            1, 100);

        homeTeam.StrengthDefence = (int)Math.Clamp(
            Math.Round(homeTeam.StrengthDefence + homeDefenceChange),
            1, 100);

        awayTeam.StrengthDefence = (int)Math.Clamp(
            Math.Round(awayTeam.StrengthDefence + awayDefenceChange),
            1, 100);


        // -----------------------------------------
        // 4. Update team form
        // -----------------------------------------

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


        // -----------------------------------------
        // 5. Save changes
        // -----------------------------------------

        await _context.SaveChangesAsync();
    }

    public void RefreshTeamStrength()
    {
        throw new NotImplementedException();
    }

    private static string AppendFormResult(string? currentForm, char result)
    {
        var newForm = (currentForm ?? string.Empty) + result;
        return newForm.Length > 5 ? newForm[^5..] : newForm;
    }
}