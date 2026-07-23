using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Models.TournamentConfigurations;

public class ThirdPlaceQualificationConfiguration
{
    public required int TotalQualifyingThirdPlaceTeams { get; init; }
    public RankingCriterion Criteria { get; init; } = RankingCriterion.PointsGoalDiffGoalsFor;
}