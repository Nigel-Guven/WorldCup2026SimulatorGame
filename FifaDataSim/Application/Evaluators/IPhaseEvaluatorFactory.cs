using WorldCupSimulator.Models.TournamentConfigurations.Enums;

namespace WorldCupSimulator.Application.Evaluators;

public interface IPhaseEvaluatorFactory
{
    IPhaseEvaluator GetEvaluator(PhaseType phaseType);
}