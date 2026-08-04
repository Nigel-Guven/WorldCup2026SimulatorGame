using WorldCupSimulator.Application.Validators;
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
        var config = ConmebolChampionship;

        //ConfigurationValidator.ValidateTournamentConfiguration(config);    
        
        return config;
    }
    
    private static readonly TournamentConfiguration ConmebolChampionship = new()
    {
        Code = "CONMEBOL_CHAMPIONSHIP",
        Name = "Conmebol Championship",
        TotalTeams = 29,
        Phases =
        [
            new MultiKnockoutPhaseConfig()
            {
                Confederation = Confederation.CONMEBOL,
                PhaseId = "CONMEBOL_PRELIMINARY",
                PhaseName = "CONMEBOL Preliminary Playoff",
                PhaseType = PhaseType.MultiBranchKnockoutStage,
                Order = 0,
                NumberOfPaths = 3,
                TeamsPerPath = 2,
                HasTwoLegs = true,
                ProgressionRules =
                [
                    new ProgressionRule()
                    {
                        FromRank = 1,
                        ToRank = 1,
                        DestinationPhaseId = Guid.NewGuid(),
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
                        FromRank = 1,
                        ToRank = 4,
                        DestinationPhaseId = Guid.NewGuid(),
                    }
                ],
                CrossGroupProgressionRules = null
            },
            new GroupPhaseConfig()
            {
                Confederation = Confederation.UEFA,
                PhaseId = "UEFA_LEAGUE",
                PhaseName = "UEFA League",
                Order = 2,
                ProgressionRules = null,
                NumberOfGroups = 4,
                TeamsPerGroup = 4,
                IsRoundRobin = true,
                LimitConfederationTeamsPerGroup = false,
                DirectProgressionRules =
                [
                    new ProgressionRule()
                    {
                        FromRank = 1,
                        ToRank = 1,
                        DestinationPhaseId = Guid.NewGuid(),
                    }
                ],
                CrossGroupProgressionRules = null
            },
            new SingleKnockoutPhaseConfig()
            {
                Confederation = Confederation.CONMEBOL,
                PhaseId = "FOOTY_FINALS",
                PhaseName = "Footy Finals",
                Order = 3,
                StartingTeamsCount = 4,
                BracketSlots = null,
                ThirdPlaceMatrix = null,
                HasTwoLegs = false,
                HasThirdPlacePlayoff = false,
                ProgressionRules = null
            },
        ]
    };
}