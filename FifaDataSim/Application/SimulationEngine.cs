using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application;

public class SimulationEngine : ISimulationEngine
{
    private readonly Random _random = new();

    public (int HomeScore, int AwayScore) SimulateMatch(Country home, Country away)
    {
        const double baseHomeExpectancy = 1.35;
        const double baseAwayExpectancy = 1.20; 
        
        double strengthDiff = home.Strength - away.Strength;
        
        var adjustment = strengthDiff * 0.015;

        var homeLambda = Math.Max(0.2, baseHomeExpectancy + adjustment);
        var awayLambda = Math.Max(0.2, baseAwayExpectancy - adjustment);


        if (home.DefaultRankingPoints > away.DefaultRankingPoints)
            homeLambda += 0.1;
        else if (away.DefaultRankingPoints > home.DefaultRankingPoints)
            awayLambda += 0.1;

        var homeGoals = KnuthPoissonRandom(homeLambda);
        var awayGoals = KnuthPoissonRandom(awayLambda);

        return (homeGoals, awayGoals);
    }

    private int KnuthPoissonRandom(double lambda)
    {
        var l = Math.Exp(-lambda);
        var k = 0;
        var p = 1.0;

        do
        {
            k++;
            p *= _random.NextDouble();
        } while (p > l);

        return k - 1;
    }
}