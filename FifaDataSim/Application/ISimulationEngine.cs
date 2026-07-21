using WorldCupSimulator.Models;

namespace WorldCupSimulator.Application;

public interface ISimulationEngine
{
    (int HomeScore, int AwayScore) SimulateMatch(Country home, Country away);
    void SimulateKnockoutMatch(KnockoutMatch match);
}