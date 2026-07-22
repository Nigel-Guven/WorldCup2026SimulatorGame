import type { BracketTab } from "../../hooks/useKnockoutBracket";

interface BracketTabNavigationProps {
  activeTab: BracketTab;
  onTabChange: (tab: BracketTab) => void;
}

const TABS: { id: BracketTab; label: string }[] = [
  { id: 'ALL', label: 'Full Bracket' },
  { id: 'R32', label: 'R32' },
  { id: 'R16', label: 'R16' },
  { id: 'QF', label: 'QF' },
  { id: 'SF', label: 'SF' },
  { id: 'FINAL', label: 'FINAL' },
];

export function BracketTabNavigation({
  activeTab,
  onTabChange,
}: BracketTabNavigationProps) {
  return (
    <div className="flex space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${
            activeTab === tab.id
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}