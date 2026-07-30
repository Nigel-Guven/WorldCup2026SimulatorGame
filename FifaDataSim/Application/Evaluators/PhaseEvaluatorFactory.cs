using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Application.Evaluators;

public class PhaseEvaluatorFactory(IServiceProvider serviceProvider) : IPhaseEvaluatorFactory
{
    public IPhaseEvaluator GetEvaluator(PhaseType phaseType)
    {
        return phaseType switch
        {
            PhaseType.GroupStage => serviceProvider.GetRequiredService<GroupStagePhaseEvaluator>(),
            PhaseType.MultiBranchKnockoutStage => serviceProvider.GetRequiredService<MultiKnockoutPhaseEvaluator>(),
            PhaseType.SingleBranchKnockoutStage => serviceProvider.GetRequiredService<SingleKnockoutPhaseEvaluator>(),
            _ => throw new NotSupportedException($"No evaluator registered for PhaseType: {phaseType}")
        };
    }
}