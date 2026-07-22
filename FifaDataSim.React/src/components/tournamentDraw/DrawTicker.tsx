interface DrawTickerProps {
  history: string[];
}

export function DrawTicker({ history }: DrawTickerProps) {
  return (
    <div className="mt-6 border-t border-slate-800 pt-4">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
        Live Draw Ticker Feed
      </h4>
      <div className="bg-slate-950 rounded-lg p-3 h-16 overflow-y-auto text-xs font-mono text-slate-400 divide-y divide-slate-900">
        {history.map((log, i) => (
          <p key={i} className={`py-1 ${i === 0 ? 'text-emerald-400 font-bold' : ''}`}>
            {log}
          </p>
        ))}
      </div>
    </div>
  );
}