import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './App';
import './index.css';

// vite-react-ssg bootstraps the app for both static generation (build) and
// hydration (client). Routes are defined in App.tsx.
export const createRoot = ViteReactSSG({ routes });
