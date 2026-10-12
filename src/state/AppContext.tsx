import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import {
  initialState,
  quizReducer,
  type AppState,
  type QuizAction,
} from './quizReducer';

/**
 * Single app/session context. This is the deliberate seam for adding
 * authentication later: a real session can be introduced here without
 * reworking the quiz or results features (Req 11).
 */

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<QuizAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
