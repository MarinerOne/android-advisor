import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './state/AppContext';
import { Layout } from './components/common/Layout';
import { Landing } from './routes/Landing';
import { Quiz } from './routes/Quiz';
import { Results } from './routes/Results';
import { Browse } from './routes/Browse';
import { PhoneDetail } from './routes/PhoneDetail';
import { Favourites } from './routes/Favourites';

/**
 * HashRouter is used so the static bundle also works when opened from a file
 * path inside a native WebView wrapper (no server-side routing needed).
 *
 * Browse / detail / favourites use the wide layout; quiz pages stay narrow.
 */
export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Landing />
              </Layout>
            }
          />
          <Route
            path="/quiz"
            element={
              <Layout>
                <Quiz />
              </Layout>
            }
          />
          <Route
            path="/results"
            element={
              <Layout wide>
                <Results />
              </Layout>
            }
          />
          <Route
            path="/browse"
            element={
              <Layout wide>
                <Browse />
              </Layout>
            }
          />
          <Route
            path="/phone/:id"
            element={
              <Layout wide>
                <PhoneDetail />
              </Layout>
            }
          />
          <Route
            path="/favourites"
            element={
              <Layout wide>
                <Favourites />
              </Layout>
            }
          />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
