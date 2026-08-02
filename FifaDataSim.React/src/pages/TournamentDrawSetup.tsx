import React, { useState, useEffect } from 'react';
import type { PhaseType } from '../types/phaseType';

// TypeScript interfaces matching the backend DTOs
export interface CountryDto {
  id: string;
  name: string;
  short_name: string;
  confederation: number;
  football_association: string;
  default_points: number;
  strength: number;
  flag_url?: string;
  home_stadium?: string;
  form?: string;
}

export interface PotDto {
  number: number;
  countries: CountryDto[];
}

export interface TournamentDrawSetupDto {
  tournamentCode: string;
  tournamentName: string;
  phaseId: string;
  phaseType: PhaseType;
  pots: PotDto[];
}

interface TournamentDrawSetupProps {
  tournamentCode: string;
  phaseId?: string;
}

export default function TournamentDrawSetup({ tournamentCode, phaseId }: TournamentDrawSetupProps) {
  const [setup, setSetup] = useState<TournamentDrawSetupDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrawSetup() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ tournamentCode });
        if (phaseId) params.append('phaseId', phaseId);

        const response = await fetch(`http://localhost:5002/api/tournament/draw-setup?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(response.statusText || 'Failed to fetch draw setup.');
        }

        const data: TournamentDrawSetupDto = await response.json();
        setSetup(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (tournamentCode) {
      fetchDrawSetup();
    }
  }, [tournamentCode, phaseId]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading draw setup...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!setup) {
    return <div className="p-6 text-center text-gray-500">No draw setup found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header Info */}
      <div className="mb-8 bg-white shadow rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{setup.tournamentName}</h1>
        <p className="text-sm text-gray-500 mt-1">Code: <span className="font-mono font-semibold">{setup.tournamentCode}</span></p>
        <p className="text-sm text-gray-500">Phase ID: <span className="font-mono font-semibold">{setup.phaseId}</span></p>
      </div>

      {/* Pots Grid */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Seeding Pots</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {setup.pots?.map((pot) => (
          <div key={pot.number} className="bg-white rounded-lg shadow border border-gray-200 flex flex-col">
            <div className="bg-indigo-600 text-white px-4 py-3 rounded-t-lg font-semibold flex justify-between items-center">
              <span>Pot {pot.number}</span>
              <span className="text-xs bg-indigo-700 px-2 py-1 rounded-full">
                {pot.countries?.length || 0} Teams
              </span>
            </div>
            
            <div className="p-4 flex-1 space-y-3">
              {pot.countries?.map((country) => (
                <div 
                  key={country.id} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {country.flag_url ? (
                      <img 
                        src={country.flag_url} 
                        alt={`${country.name} flag`} 
                        className="w-6 h-4 object-cover rounded shadow-sm" 
                      />
                    ) : (
                      <div className="w-6 h-4 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-500">
                        🏴
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{country.name}</p>
                      <p className="text-xs text-gray-400">{country.short_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      Str: {country.strength}
                    </span>
                  </div>
                </div>
              ))}
              {(!pot.countries || pot.countries.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No teams in this pot.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}