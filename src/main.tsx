import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './App';
import { initAnalytics } from './analytics/init';
import './index.css';

// vite-react-ssg bootstraps the app for both static generation (build) and
// hydration (client). Routes are defined in App.tsx. The second argument runs
// once per environment; we initialise analytics on the client only.
export const createRoot = ViteReactSSG({ routes }, ({ isClient }) => {
  if (isClient) {
    initAnalytics();
  }
});
