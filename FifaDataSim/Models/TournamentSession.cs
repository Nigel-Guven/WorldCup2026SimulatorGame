namespace WorldCupSimulator.Models;

public class TournamentSession(string tournamentConfigCode)
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string TournamentConfigCode { get; private set; } = tournamentConfigCode;
    public List<PhaseState> PhaseStates { get; private set; } = [];
    public HashSet<string> QualifiedTeamCodes { get; private set; } = [];
    public HashSet<string> EliminatedTeamCodes { get; private set; } = [];
    public Dictionary<string, List<Country>> PhaseStagingPools { get; private set; } = [];

    public void AddToStaging(string targetPhaseId, Country team)
    {
        if (!PhaseStagingPools.TryGetValue(targetPhaseId, out var pool))
        {
            pool = [];
            PhaseStagingPools[targetPhaseId] = pool;
        }
        pool.Add(team);
    }
    
    public (PhaseState? phaseState, MatchFixture? fixture) FindFixtureWithPhase(Guid fixtureId)
    {
        foreach (var phase in PhaseStates)
        {
            var fixture = phase.Fixtures.FirstOrDefault(f => f.Id == fixtureId);
        
            if (fixture != null)
            {
                return (phase, fixture);
            }
        }

        return (null, null);
    }
}