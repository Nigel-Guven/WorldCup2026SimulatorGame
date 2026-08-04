import type { ActivePage } from '../../App';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export default function Navbar({
  activePage,
  onNavigate,
}: NavbarProps) {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="w-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-black tracking-wider text-emerald-400 uppercase">
              🏆 World Cup Sim
            </span>
          </div>
          {/* Navigation */}
          <div className="flex items-center space-x-2">

            <NavButton
              active={activePage === 'rankings'}
              onClick={() => onNavigate('rankings')}
            >
              Global Rankings
            </NavButton>

            <NavButton
              active={activePage === 'confederations'}
              onClick={() => onNavigate('confederations')}
            >
              Confederations
            </NavButton>
          </div>
        </div>
      </div>
    </nav>
  );
}


interface NavButtonProps {
  children: React.ReactNode;
  active: boolean;
  highlight?: boolean;
  onClick: () => void;
}

function NavButton({
  children,
  active,
  highlight = false,
  onClick,
}: NavButtonProps) {
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