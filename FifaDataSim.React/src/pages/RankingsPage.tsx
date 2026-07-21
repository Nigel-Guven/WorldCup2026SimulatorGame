import { useEffect, useState } from 'react';
import type { Country } from '../types/country';

export default function RankingsPage() {
  const [teams, setTeams] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5002/api/teams') 
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch team rankings');
        return res.json();
      })
      .then((data: Country[]) => {
        setTeams(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        <p className="text-xl font-semibold animate-pulse">Loading global rankings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-red-400">
        <p className="text-xl font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Global Football Rankings
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Live standings calculated across active regional confederations.
        </p>
      </div>

      <div className="bg-slate-900 shadow-xl rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <th className="py-4 px-6 text-center w-16">Rank</th>
                <th className="py-4 px-6">Team</th>
                <th className="py-4 px-6 text-center">Confed.</th>
                <th className="py-4 px-6 text-right">Points</th>
                <th className="py-4 px-6 text-right">Power</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {teams.map((team, index) => {
                const rank = index + 1;
                return (
                  <tr key={team.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4 px-6 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                        rank === 1 ? 'bg-amber-500 text-slate-950' :
                        rank === 2 ? 'bg-slate-300 text-slate-950' :
                        rank === 3 ? 'bg-amber-700 text-white' : 'text-slate-400'
                      }`}>
                        {rank}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-white">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={team.flag_url} 
                          alt="" 
                          className="w-6 h-4 object-cover rounded shadow-sm bg-slate-800"
                        />
                        <div>
                          <span className="font-semibold">{team.name}</span>
                          <span className="ml-2 text-xs text-slate-400 font-mono">({team.short_name})</span>
                          <div className="text-xs text-slate-500 font-normal group-hover:text-slate-400 transition-colors">
                            {team.home_stadium}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                        {team.confederation}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400">
                      {team.default_points.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-400">
                      {team.strength}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}