using WorldCupSimulator.Models;
using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Enums;
using WorldCupSimulator.Models.TournamentConfigurations.Phase;
using WorldCupSimulator.Models.TournamentConfigurations.Rules;

namespace WorldCupSimulator.Application;

public static class TournamentFactory
{
    public static TournamentConfiguration GetByCode(string code)
    {
            return ConmebolChampionship;
    }

    private static readonly TournamentConfiguration WorldCup2022 = new()
    {
        Code = "WorldCup32Teams",
        Name = "World Cup 32",
        TotalTeams = 32,
        Phases =
        [
            new SingleKnockoutPhaseConfig()
            {
                PhaseId = "CONMEBOL_PRELIMINARY",
                PhaseName = "CONMEBOL Preliminary Playoff",
                Order = 0,
                StartingTeamsCount = 4,
                BracketSlots = null,
                ThirdPlaceMatrix = null,
                HasTwoLegs = true,
                HasThirdPlacePlayoff = false,
                ProgressionRules =
                [
                    new ProgressionRule()
                    {
                        StartRank = 1,
                        EndRank = 1,
                        TargetPhaseId = "CONMEBOL_LEAGUE", // Winner moves to the main league
                    }
                ]
            },

            new GroupPhaseConfig()
            {
                PhaseId = "CONMEBOL_LEAGUE",
                PhaseName = "CONMEBOL League",
                Order = 1,
                ProgressionRules =
                [
                    new ProgressionRule()
                    {
                        StartRank = 0,
                        EndRank = 4,
                        TargetPhaseId = "WORLD_CUP_FINALS",
                    }
                ],
                NumberOfGroups = 1,
                TeamsPerGroup = 10,
                IsRoundRobin = true,
                LimitConfederationTeamsPerGroup = false,
                DirectProgressionRules =
                [
                    new ProgressionRule()
                    {
                        EndRank = 0,
                        StartRank = 0,
                        TargetPhaseId = "CONMEBOL_LEAGUE",
                    }
                ],
                CrossGroupProgressionRules =
                [
                    new CrossGroupProgressionRule()
                    {
                        EndRank = 0,
                        StartRank = 0,
                        TargetPhaseId = "CONMEBOL_LEAGUE",
                    }
                ]
            }
        ]
    };
    
    private static readonly TournamentConfiguration ConmebolChampionship = new()
    {
        Code = "CONMEBOL_CHAMPIONSHIP",
        Name = "Conmebol Championship",
        TotalTeams = 13,
        Phases =
        [
            new SingleKnockoutPhaseConfig()
            {
                Confederation = Confederation.CONMEBOL,
                PhaseId = "CONMEBOL_PRELIMINARY",
                PhaseName = "CONMEBOL Preliminary Playoff",
                PhaseType = PhaseType.SingleBranchKnockoutStage,
                Order = 0,
                StartingTeamsCount = 4,
                BracketSlots = null,
                ThirdPlaceMatrix = null,
                HasTwoLegs = true,
                HasThirdPlacePlayoff = false,
                ProgressionRules =
                [
                    new ProgressionRule()
                    {
                        StartRank = 1,
                        EndRank = 1,
                        TargetPhaseId = "CONMEBOL_LEAGUE",
                    }
                ]
            },
            new GroupPhaseConfig()
            {
                Confederation = Confederation.CONMEBOL,
                PhaseId = "CONMEBOL_LEAGUE",
                PhaseName = "CONMEBOL League",
                Order = 1,
                ProgressionRules = null,
                NumberOfGroups = 1,
                TeamsPerGroup = 10,
                IsRoundRobin = true,
                LimitConfederationTeamsPerGroup = false,
                DirectProgressionRules =
                [
                    new ProgressionRule()
                    {
                        EndRank = 1,
                        StartRank = 4,
                        TargetPhaseId = "CONMEBOL_FINALS",
                    }
                ],
                CrossGroupProgressionRules = null
            },

            new SingleKnockoutPhaseConfig()
            {
                Confederation = Confederation.CONMEBOL,
                PhaseId = "CONMEBOL_FINALS",
                PhaseName = "CONMEBOL Finals",
                Order = 2,
                StartingTeamsCount = 4,
                BracketSlots = null,
                ThirdPlaceMatrix = null,
                HasTwoLegs = false,
                HasThirdPlacePlayoff = false,
                ProgressionRules = null
            }
        ]
    };
}