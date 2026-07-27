interface NavigationButtonProps {
  children: React.ReactNode;
  active: boolean;
  highlight?: boolean;
  onClick: () => void;
}

export default function NavigationButton({
  children,
  active,
  highlight = false,
  onClick,
}: NavigationButtonProps) {
  const activeStyle =
    'bg-emerald-500 text-slate-950 shadow-md';

  const inactiveStyle = highlight
    ? 'text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/10'
    : 'text-slate-300 hover:bg-slate-800 hover:text-white';

  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg text-sm font-bold transition-all
        ${active ? activeStyle : inactiveStyle}
      `}
    >
      {children}
    </button>
  );
}