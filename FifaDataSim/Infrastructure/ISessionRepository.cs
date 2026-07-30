using WorldCupSimulator.Models;

namespace WorldCupSimulator.Infrastructure
{
    public interface ISessionRepository
    {
        TournamentSession? GetById(Guid id);
        void Save(TournamentSession session);
        void Delete(Guid id);
    }
}