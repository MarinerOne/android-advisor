import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './state/AppContext';
import { Layout } from './components/common/Layout';
import { Landing } from './routes/Landing';
import { Quiz } from './routes/Quiz';
import { Results } from './routes/Results';

/**
 * HashRouter is used so the static bundle also works when opened from a file
 * path inside a native WebView wrapper (no server-side routing needed).
 */
export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}
