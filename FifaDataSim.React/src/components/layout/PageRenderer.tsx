import type { ActivePage } from '../../App';
import type { TournamentSession } from '../../types/tournamentSession';

import RankingsPage from '../../pages/RankingsPage';
import TournamentDrawPage from '../../pages/TournamentDrawPage';
import MatchCentrePage from '../../pages/MatchCentrePage';
import KnockoutBracketPage from '../../pages/KnockoutBracketPage';

interface PageRendererProps {
  activePage: ActivePage;
  session: TournamentSession | null;

  onSessionUpdate: (session: TournamentSession) => void;

  onDrawComplete: (
    drawnGroups: { name: string; teams: any[] }[]
  ) => Promise<TournamentSession>;

  onNavigate: (page: ActivePage) => void;
}

export default function PageRenderer({
  activePage,
  session,
  onSessionUpdate,
  onDrawComplete,
  onNavigate,
}: PageRendererProps) {
  switch (activePage) {
    case 'rankings':
      return <RankingsPage />;

    case 'draw':
      return (
        <TournamentDrawPage
          onDrawComplete={onDrawComplete}
          hasExistingSession={session !== null}
        />
      );

    case 'centre':
      if (!session) {
        return null;
      }

      return (
        <MatchCentrePage
          session={session}
          onSessionUpdate={onSessionUpdate}
          onNavigateToKnockout={() => onNavigate('knockout')}
        />
      );

    case 'knockout':
      if (!session) {
        return null;
      }

      return <KnockoutBracketPage />;

    default:
      return null;
  }
}