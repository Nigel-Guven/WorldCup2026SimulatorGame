using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application.Simulations;

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

    public void SimulateKnockoutMatch(KnockoutMatch match)
    {
        if (match.HomeTeam == null || match.AwayTeam == null)
            throw new InvalidOperationException("Both teams must be present to simulate a knockout match.");

        var (home, away) = SimulateMatch(match.HomeTeam, match.AwayTeam);
        match.HomeScore = home;
        match.AwayScore = away;

        if (home != away)
        {
            match.Winner = home > away ? match.HomeTeam : match.AwayTeam;
            return;
        }
        
        match.WentToExtraTime = true;
        var strengthDiff = match.HomeTeam.Strength - match.AwayTeam.Strength;
        var etHomeLambda = Math.Max(0.05, 0.40 + (strengthDiff * 0.005));
        var etAwayLambda = Math.Max(0.05, 0.35 - (strengthDiff * 0.005));

        var etHomeGoals = KnuthPoissonRandom(etHomeLambda);
        var etAwayGoals = KnuthPoissonRandom(etAwayLambda);

        match.HomeExtraTimeScore = home + etHomeGoals;
        match.AwayExtraTimeScore = away + etAwayGoals;

        if (match.HomeExtraTimeScore != match.AwayExtraTimeScore)
        {
            match.Winner = match.HomeExtraTimeScore > match.AwayExtraTimeScore ? match.HomeTeam : match.AwayTeam;
            return;
        }
        
        match.WentToPenalties = true;

        var homeWinProb = 0.50 + ((match.HomeTeam.Strength - match.AwayTeam.Strength) * 0.003);
        homeWinProb = Math.Clamp(homeWinProb, 0.20, 0.80);

        var homePens = 0;
        var awayPens = 0;

        for (var i = 0; i < 5; i++)
        {
            if (_random.NextDouble() <= homeWinProb) homePens++;
            if (_random.NextDouble() <= (1.0 - homeWinProb)) awayPens++;
        }

        while (homePens == awayPens)
        {
            var homeScored = _random.NextDouble() <= homeWinProb;
            var awayScored = _random.NextDouble() <= (1.0 - homeWinProb);

            if (homeScored) homePens++;
            if (awayScored) awayPens++;
        }

        match.HomePenaltyScore = homePens;
        match.AwayPenaltyScore = awayPens;
        match.Winner = homePens > awayPens ? match.HomeTeam : match.AwayTeam;
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