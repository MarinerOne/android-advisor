import type { RouteRecord } from 'vite-react-ssg';
import { RootLayout } from './components/common/RootLayout';
import { Landing } from './routes/Landing';
import { Quiz } from './routes/Quiz';
import { Results } from './routes/Results';
import { Browse } from './routes/Browse';
import { Favourites } from './routes/Favourites';

/**
 * Route configuration for vite-react-ssg. Every route here is pre-rendered to
 * static HTML at build time. The phone detail route is dynamic: its
 * getStaticPaths (in PhoneDetail.tsx) enumerates all 100 phones so each gets
 * its own crawlable page.
 */
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <RootLayout />,
    entry: 'src/components/common/RootLayout.tsx',
    children: [
      { index: true, Component: Landing },
      { path: 'quiz', Component: Quiz },
      { path: 'results', Component: Results },
      { path: 'browse', Component: Browse },
      { path: 'favourites', Component: Favourites },
      {
        path: 'phone/:id',
        // Component + getStaticPaths are exported from PhoneDetail.tsx.
        lazy: () => import('./routes/PhoneDetail'),
      },
    ],
  },
];
