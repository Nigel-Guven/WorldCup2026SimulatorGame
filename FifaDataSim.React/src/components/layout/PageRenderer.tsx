import type { ActivePage } from '../../App';

import RankingsPage from '../../pages/RankingsPage';
import TournamentCreatorPage from '../../pages/TournamentCreatorPage';

interface PageRendererProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export default function PageRenderer({
  activePage
}: PageRendererProps) {
  switch (activePage) {
    case 'rankings':
      return <RankingsPage />;
    case 'confederations':
      return <TournamentCreatorPage />;
    default:
      return null;
  }
}