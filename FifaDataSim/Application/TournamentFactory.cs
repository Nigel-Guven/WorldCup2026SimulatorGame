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
            NthPlaceRule = new ThirdPlaceQualificationConfiguration { TotalQualifyingThirdPlaceTeams = 8 }
        },
        KnockoutStage = new KnockoutStageConfiguration
        {
            StartingRound = KnockoutRound.RoundOf32,
            HasThirdPlaceMatch = true
        }
    };
    
    private static readonly TournamentConfiguration OceaniaQualificationFirstRound = new()
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
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration OceaniaQualificationSecondRound = new()
    {
        
        Code = "OCEANIA_WORLD_CUP_QUALIFIERS",
        Name = "OCEANIA World Cup Qualifiers",
        TotalTeams = 8,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 4,
            SortingType = PotSortingType.Strict,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 2,
            TeamsPerGroup = 4,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration ConmebolQualificationFirstRound = new()
    {
        
        Code = "OCEANIA_WORLD_CUP_QUALIFIERS",
        Name = "OCEANIA World Cup Qualifiers",
        TotalTeams = 10,
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
            NumberOfGroups = 1,
            TeamsPerGroup = 5,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration CafQualificationFirstRound = new()
    {
        
        Code = "OCEANIA_WORLD_CUP_QUALIFIERS",
        Name = "OCEANIA World Cup Qualifiers",
        TotalTeams = 60,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 6,
            SortingType = PotSortingType.Strict,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 10,
            TeamsPerGroup = 6,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = new ThirdPlaceQualificationConfiguration()
            {
                Criteria = RankingCriterion.PointsGoalDiffGoalsFor,
                TotalQualifyingThirdPlaceTeams = 6
            }
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration SuperCup = new()
    {
        
        Code = "SUPER_CUP",
        Name = "Super Cup",
        TotalTeams = 64,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 4,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 16,
            TeamsPerGroup = 4,
            AutomaticQualifiersPerGroup = 2,
            Matchmaking = MatchmakingType.SingleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration UEFANationsLeague = new()
    {
        
        Code = "Uefa_Preliminaries",
        Name = "Uefa Preliminaries",
        TotalTeams = 70,
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
            NumberOfGroups = 7,
            TeamsPerGroup = 10,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration UEFAQualificationFirstRound = new()
    {
        
        Code = "Uefa_Preliminaries",
        Name = "Uefa Preliminaries",
        TotalTeams = 70,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 5,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 14,
            TeamsPerGroup = 5,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };

    private static readonly TournamentConfiguration ConcacafQualificationFirstRound = new()
    {
        
        Code = "Concacaf_Preliminaries",
        Name = "Concacaf Preliminaries",
        TotalTeams = 10,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 2,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 5,
            TeamsPerGroup = 2,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration ConcacafQualificationSecondRound = new()
    {
        
        Code = "Concacaf_Preliminaries",
        Name = "Concacaf Preliminaries",
        TotalTeams = 40,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 5,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 8,
            TeamsPerGroup = 5,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration ConcacafQualificationThirdRound = new()
    {
        
        Code = "Concacaf_Preliminaries",
        Name = "Concacaf Preliminaries",
        TotalTeams = 8,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 4,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 2,
            TeamsPerGroup = 4,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration AfcQualificationFirstRound = new()
    {
        
        Code = "Concacaf_Preliminaries",
        Name = "Concacaf Preliminaries",
        TotalTeams = 24,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 2,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 12,
            TeamsPerGroup = 2,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration AfcQualificationSecondRound = new()
    {
        
        Code = "Concacaf_Preliminaries",
        Name = "Concacaf Preliminaries",
        TotalTeams = 48,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 6,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 8,
            TeamsPerGroup = 6,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration AfcQualificationThirdRound = new()
    {
        Code = "Concacaf_Preliminaries",
        Name = "Concacaf Preliminaries",
        TotalTeams = 8,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 4,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 2,
            TeamsPerGroup = 4,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
    
    private static readonly TournamentConfiguration ConfederationPlayoffRound = new()
    {
        Code = "Concacaf_Preliminaries",
        Name = "Concacaf Preliminaries",
        TotalTeams = 20,
        ConfederationSlots = null,
        Pots = new PotConfiguration
        {
            TotalPots = 2,
            SortingType = PotSortingType.WorldRanking,
            HostInPotOne = true,
            DrawConstraints = null
        },
        GroupStage = new GroupStageConfiguration
        {
            NumberOfGroups = 10,
            TeamsPerGroup = 2,
            AutomaticQualifiersPerGroup = 1,
            Matchmaking = MatchmakingType.DoubleRoundRobin,
            NthPlaceRule = null
        },
        KnockoutStage = null
    };
}