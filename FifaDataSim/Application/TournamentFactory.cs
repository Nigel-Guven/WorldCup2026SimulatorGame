using WorldCupSimulator.Models.Countries;
using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Application;

public static class TournamentFactory
{
    public static TournamentConfiguration GetByCode(string code)
    {
            return SuperCup;
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
    
    private static readonly TournamentConfiguration OceaniaQualification = new()
    {
        
        Code = "OCEANIA_WORLD_CUP_QUALIFIERS",
        Name = "OCEANIA World Cup Qualifiers",
        TotalTeams = 20,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 5,
            SortingType = PotSortingType.Strict,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 4,
            TeamsPerGroup = 5,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            ThirdPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration SuperCup = new()
    {
        
        Code = "SUPER_CUP",
        Name = "Super Cup",
        TotalTeams = 250,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 10,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 25,
            TeamsPerGroup = 10,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.SingleRoundRobin,
            ThirdPlaceRule = null
        },
        KnockoutStage = null
    };
}