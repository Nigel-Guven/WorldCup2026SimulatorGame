import type { ActivePage } from '../../App';
import ConfederationTeams from '../../pages/ConfederationTeams';

import RankingsPage from '../../pages/RankingsPage';

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
      return <ConfederationTeams />;
    default:
      return null;
  }
}