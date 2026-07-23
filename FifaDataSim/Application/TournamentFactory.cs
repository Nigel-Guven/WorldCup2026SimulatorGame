using WorldCupSimulator.Models.Countries;
using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Application;

public static class TournamentFactory
{
    public static TournamentConfiguration GetByCode(string code)
    {
            return Custom28;
    }
    
    public static readonly TournamentConfiguration WorldCup2026 = new()
    {
        Code = "WORLD_CUP_2026",
        Name = "FIFA World Cup 2026",
        TotalTeams = 48,
        ConfederationSlots = new Dictionary<Confederation, int>
        {
            { Confederation.UEFA, 16 },
            { Confederation.CAF, 9 },
            { Confederation.AFC, 8 },
            { Confederation.CONCACAF, 7 },
            { Confederation.CONMEBOL, 6 },
            { Confederation.OFC, 2 },
        },
        Pots = new PotConfiguration
        {
            TotalPots = 4,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = new DrawConstraintsConfiguration
            {
                SeparateConfederations = true,
                MaxTeamsPerConfederation = new Dictionary<Confederation, int>
                {
                    { Confederation.UEFA, 2 },
                    { Confederation.AFC, 1 },
                    { Confederation.CAF, 1 },
                    { Confederation.CONMEBOL, 1 },
                    { Confederation.CONCACAF, 1 },
                    { Confederation.OFC, 1 },
                }
            }
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 12,
            TeamsPerGroup = 4,
            AutomaticQualifiersPerGroup = 2,
            Matchmaking = MatchmakingType.SingleRoundRobin,
            ThirdPlaceRule = new ThirdPlaceQualificationConfiguration { TotalQualifyingThirdPlaceTeams = 8 }
        },
        KnockoutStage = new KnockoutStageConfiguration
        {
            StartingRound = KnockoutRound.RoundOf32,
            HasThirdPlaceMatch = true
        }
    };

    private static readonly TournamentConfiguration EURO2028 = new()
    {
        Code = "EURO_2028",
        Name = "UEFA Euro 2028",
        TotalTeams = 24,
        ConfederationSlots = new Dictionary<Confederation, int>
        {
            { Confederation.UEFA, 24 },
            { Confederation.CAF, 0 },
            { Confederation.AFC, 0 },
            { Confederation.CONCACAF, 0 },
            { Confederation.CONMEBOL, 0 },
            { Confederation.OFC, 0 },
        },
        Pots = new PotConfiguration
        {
            TotalPots = 4,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = new DrawConstraintsConfiguration
            {
                SeparateConfederations = true,
                MaxTeamsPerConfederation = new Dictionary<Confederation, int>
                {
                    { Confederation.UEFA, 4 },
                    { Confederation.AFC, 0 },
                    { Confederation.CAF, 0 },
                    { Confederation.CONMEBOL, 0 },
                    { Confederation.CONCACAF, 0 },
                    { Confederation.OFC, 0 },
                }
            }
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 6,
            TeamsPerGroup = 4,
            AutomaticQualifiersPerGroup = 2,
            Matchmaking = MatchmakingType.SingleRoundRobin,
            ThirdPlaceRule = new ThirdPlaceQualificationConfiguration { TotalQualifyingThirdPlaceTeams = 4 }
        },
        KnockoutStage = new KnockoutStageConfiguration
        {
            StartingRound = KnockoutRound.RoundOf16,
            HasThirdPlaceMatch = true
        }
    };
    
    private static readonly TournamentConfiguration Custom28 = new()
    {
        Code = "Custom Tourney",
        Name = "Targaryen Tourney",
        TotalTeams = 80,
        ConfederationSlots = new Dictionary<Confederation, int>
        {
            { Confederation.UEFA, 32 },
            { Confederation.CAF, 12 },
            { Confederation.AFC, 12 },
            { Confederation.CONCACAF, 10 },
            { Confederation.CONMEBOL, 10 },
            { Confederation.OFC, 4 },
        },
        Pots = new PotConfiguration
        {
            TotalPots = 4,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = new DrawConstraintsConfiguration
            {
                SeparateConfederations = true,
                MaxTeamsPerConfederation = new Dictionary<Confederation, int>
                {
                    { Confederation.UEFA, 6 },
                    { Confederation.AFC, 6 },
                    { Confederation.CAF, 6 },
                    { Confederation.CONMEBOL, 6 },
                    { Confederation.CONCACAF, 6 },
                    { Confederation.OFC, 6 },
                }
            }
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 20,
            TeamsPerGroup = 4,
            AutomaticQualifiersPerGroup = 2,
            Matchmaking = MatchmakingType.SingleRoundRobin,
            ThirdPlaceRule = new ThirdPlaceQualificationConfiguration { TotalQualifyingThirdPlaceTeams = 8 }
        },
        KnockoutStage = new KnockoutStageConfiguration
        {
            StartingRound = KnockoutRound.RoundOf32,
            HasThirdPlaceMatch = true
        }
    };
}