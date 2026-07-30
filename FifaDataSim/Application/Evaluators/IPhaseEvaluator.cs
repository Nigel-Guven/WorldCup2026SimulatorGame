using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application.Evaluators;

public partial interface IPhaseEvaluator
{
    List<TeamRanking> CalculateRankings(PhaseState phaseState);
}