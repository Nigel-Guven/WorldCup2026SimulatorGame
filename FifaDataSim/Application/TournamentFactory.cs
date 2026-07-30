using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Phase;
using WorldCupSimulator.Models.TournamentConfigurations.Rules;

namespace WorldCupSimulator.Application;

public static class TournamentFactory
{
    public static TournamentConfiguration GetByCode(string code)
    {
            return WorldCup2022;
    }

    private static readonly TournamentConfiguration WorldCup2022 = new()
    {
    };
}