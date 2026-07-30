using WorldCupSimulator.Infrastructure;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application.Evaluators;

public class GroupStagePhaseEvaluator(ICountryRepository countryRepository) : IPhaseEvaluator
{
    public List<TeamRanking> CalculateRankings(PhaseState phaseState)
    {
        if (phaseState is not GroupPhaseState groupState)
            throw new ArgumentException("Phase state mismatch. Expected GroupPhaseState.");

        var rankings = new List<TeamRanking>();
        var allCountries = countryRepository.GetAllTeams().ToList();

        foreach (var group in groupState.Groups)
        {
            for (var i = 0; i < group.Standings.Count; i++)
            {
                var standing = group.Standings[i];
                var team = allCountries.FirstOrDefault(c => c.Id == standing.TeamId);
                
                if (team != null)
                {
                    rankings.Add(new TeamRanking(team, i + 1, group.Name));
                }
            }
        }

        return rankings;
    }
}