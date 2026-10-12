import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from './Layout';
import { AppProvider } from '../../state/AppContext';

/**
 * Root layout rendered by the SSG router. Chooses a wide container for the
 * browsing pages and a narrow one for the quiz, then renders the matched
 * route via <Outlet/>.
 */
const WIDE_PREFIXES = ['/browse', '/favourites', '/phone', '/results'];

export function RootLayout() {
  const { pathname } = useLocation();
  const wide = WIDE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  return (
    <AppProvider>
      <Layout wide={wide}>
        <Outlet />
      </Layout>
    </AppProvider>
  );
}
