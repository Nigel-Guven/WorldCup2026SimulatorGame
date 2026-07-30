using System.Collections.Concurrent;
using WorldCupSimulator.Models;

namespace WorldCupSimulator.Infrastructure;

public class InMemorySessionRepository : ISessionRepository
{
    private readonly ConcurrentDictionary<Guid, TournamentSession> _sessions = new();

    public TournamentSession? GetById(Guid id)
    {
        _sessions.TryGetValue(id, out var session);
        return session;
    }

    public void Save(TournamentSession session)
    {
        _sessions[session.Id] = session;
    }

    public void Delete(Guid id)
    {
        _sessions.TryRemove(id, out _);
    }
}