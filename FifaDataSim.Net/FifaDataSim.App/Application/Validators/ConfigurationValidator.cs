using WorldCupSimulator.Models.TournamentConfigurations;
using WorldCupSimulator.Models.TournamentConfigurations.Phase;
using WorldCupSimulator.Models.TournamentConfigurations.Rules;

namespace WorldCupSimulator.Application.Validators;

public class ConfigurationValidator
{/*
    public static void ValidateTournamentConfiguration(TournamentConfiguration config)
    {
        ArgumentNullException.ThrowIfNull(config);

        if (string.IsNullOrWhiteSpace(config.Code))
            throw new InvalidOperationException("Tournament configuration must have a valid 'Code'.");

        if (string.IsNullOrWhiteSpace(config.Name))
            throw new InvalidOperationException($"Tournament '{config.Code}' must have a valid 'Name'.");

        if (config.TotalTeams <= 0)
            throw new InvalidOperationException($"Tournament '{config.Code}' must specify TotalTeams > 0.");

        if (config.Phases == null || config.Phases.Count == 0)
            throw new InvalidOperationException($"Tournament '{config.Code}' must contain at least one phase.");

        var existingPhaseIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var phaseOrders = new HashSet<int>();

        foreach (var phase in config.Phases)
        {
            if (string.IsNullOrWhiteSpace(phase.PhaseId))
                throw new InvalidOperationException($"A phase in tournament '{config.Code}' has an empty PhaseId.");
            
            if (phase.Confederation == null)
                throw new InvalidOperationException($"Phase {phase.PhaseId} in tournament '{phase.Confederation}' does not have Confederation specified.");

            if (!existingPhaseIds.Add(phase.PhaseId))
                throw new InvalidOperationException($"Duplicate PhaseId '{phase.PhaseId}' found in tournament '{config.Code}'.");
            
            if (!phaseOrders.Add(phase.Order))
                throw new InvalidOperationException($"Duplicate Phase Order '{phase.Order}' found for PhaseId '{phase.PhaseId}'.");

            switch (phase)
            {
                case SingleKnockoutPhaseConfig singleKnockout:
                    ValidateSingleKnockoutPhase(singleKnockout);
                    break;

                case GroupPhaseConfig groupPhase:
                    ValidateGroupPhase(groupPhase);
                    break;

                case MultiKnockoutPhaseConfig multiKnockout:
                    ValidateMultiKnockoutPhase(multiKnockout);
                    break;

                default:
                    throw new NotSupportedException($"Unsupported phase configuration type '{phase.GetType().Name}' for PhaseId '{phase.PhaseId}'.");
            }

            ValidateProgressionRules(phase, config.Phases);
        }
    }

    private static void ValidateSingleKnockoutPhase(SingleKnockoutPhaseConfig config)
    {
        if (config.StartingTeamsCount <= 0)
            throw new InvalidOperationException($"Knockout Phase '{config.PhaseId}' must have StartingTeamsCount > 0.");
        
        if (config.StartingTeamsCount < 2)
            throw new InvalidOperationException($"Knockout Phase '{config.PhaseId}' must have at least 2 teams.");
        
        if (config.StartingTeamsCount % 2 != 0)
            throw new InvalidOperationException($"Knockout Phase '{config.PhaseId}' must have teams to the power of 2.");
    }

    private static void ValidateGroupPhase(GroupPhaseConfig config)
    {
        if (config.NumberOfGroups <= 0)
            throw new InvalidOperationException($"Group Phase '{config.PhaseId}' must have NumberOfGroups > 0.");

        if (config.TeamsPerGroup <= 0)
            throw new InvalidOperationException($"Group Phase '{config.PhaseId}' must have TeamsPerGroup > 0.");
    }

    private static void ValidateMultiKnockoutPhase(MultiKnockoutPhaseConfig config)
    {
        if (config.NumberOfPaths <= 0)
            throw new InvalidOperationException($"Multi-Knockout Phase '{config.PhaseId}' must have NumberOfPaths > 0.");

        if (config.TeamsPerPath <= 0)
            throw new InvalidOperationException($"Multi-Knockout Phase '{config.PhaseId}' must have TeamsPerPath > 0.");
    }

    private static void ValidateProgressionRules(TournamentPhaseConfig phase, List<TournamentPhaseConfig> allPhases)
    {
        var directProgressionRules = new List<ProgressionRule>();
        var crossGroupProgressionRules = new List<CrossGroupProgressionRule>();
        
        if (phase.ProgressionRules != null)
            directProgressionRules.AddRange(phase.ProgressionRules);

        if (phase is GroupPhaseConfig groupPhase)
        {
            if (groupPhase.DirectProgressionRules != null)
                directProgressionRules.AddRange(groupPhase.DirectProgressionRules);
            if (groupPhase.CrossGroupProgressionRules != null)
                crossGroupProgressionRules.AddRange(groupPhase.CrossGroupProgressionRules);
        }

        foreach (var rule in directProgressionRules)
        {
            if (rule.FromRank <= 0 || rule.ToRank <= 0)
                throw new InvalidOperationException($"Progression rule in Phase '{phase.PhaseId}' must have positive rank bounds (StartRank and EndRank).");

            if (rule.FromRank > rule.ToRank)
                throw new InvalidOperationException($"Progression rule in Phase '{phase.PhaseId}' has StartRank ({rule.StartRank}) greater than EndRank ({rule.EndRank}).");

            if (!string.IsNullOrEmpty(rule.))
            {
                var targetPhase = allPhases.FirstOrDefault(p => string.Equals(p.PhaseId, rule.TargetPhaseId, StringComparison.OrdinalIgnoreCase));
                
                if (targetPhase == null)
                    throw new InvalidOperationException($"Progression rule in Phase '{phase.PhaseId}' references a non-existent TargetPhaseId '{rule.TargetPhaseId}'.");

                if (targetPhase.Order <= phase.Order)
                    throw new InvalidOperationException($"Progression rule in Phase '{phase.PhaseId}' points backward or sideways to TargetPhaseId '{rule.TargetPhaseId}' (Order {targetPhase.Order} <= {phase.Order}).");
            }
        }
        
        foreach (var rule in crossGroupProgressionRules)
        {
            if (rule.StartRank <= 0 || rule.EndRank <= 0)
                throw new InvalidOperationException($"Progression rule in Phase '{phase.PhaseId}' must have positive rank bounds (StartRank and EndRank).");

            if (rule.StartRank > rule.EndRank)
                throw new InvalidOperationException($"Progression rule in Phase '{phase.PhaseId}' has StartRank ({rule.StartRank}) greater than EndRank ({rule.EndRank}).");

            if (!string.IsNullOrEmpty(rule.TargetPhaseId))
            {
                var targetPhase = allPhases.FirstOrDefault(p => string.Equals(p.PhaseId, rule.TargetPhaseId, StringComparison.OrdinalIgnoreCase));
                
                if (targetPhase == null)
                    throw new InvalidOperationException($"Progression rule in Phase '{phase.PhaseId}' references a non-existent TargetPhaseId '{rule.TargetPhaseId}'.");

                if (targetPhase.Order <= phase.Order)
                    throw new InvalidOperationException($"Progression rule in Phase '{phase.PhaseId}' points backward or sideways to TargetPhaseId '{rule.TargetPhaseId}' (Order {targetPhase.Order} <= {phase.Order}).");
            }
        }
    }*/
}