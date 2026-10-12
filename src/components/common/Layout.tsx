import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useFavourites } from '../../state/favourites';

interface LayoutProps {
  children: ReactNode;
  wide?: boolean;
}

export function Layout({ children, wide = false }: LayoutProps) {
  const { count } = useFavourites();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    'font-semibold px-3 py-2 rounded-pill transition-colors duration-fast ' +
    (isActive
      ? 'bg-surface-alt text-ink'
      : 'text-ink-soft hover:text-ink hover:bg-surface-alt');

  return (
    <div className="min-h-full flex flex-col">
      <header className="w-full py-3 px-5 flex items-center justify-between gap-3 flex-wrap border-b border-border">
        <Link to="/" className="font-display font-bold text-xl text-ink">
          <span aria-hidden="true">📱</span> Android Advisor
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          <NavLink to="/browse" className={navClass}>
            Browse
          </NavLink>
          <NavLink to="/favourites" className={navClass}>
            Favourites
            {count > 0 && (
              <span className="ml-1 inline-flex items-center justify-center text-xs font-bold rounded-pill bg-primary text-primary-ink px-2 py-0.5">
                {count}
              </span>
            )}
          </NavLink>
        </nav>
      </header>
      <main
        className={
          'flex-1 w-full mx-auto px-5 py-4 flex flex-col ' +
          (wide ? 'max-w-6xl' : 'max-w-3xl')
        }
      >
        {children}
      </main>
      <footer className="w-full py-4 px-5 text-center text-sm text-ink-soft">
        Helping you find your perfect Android phone.
      </footer>
    </div>
  );
}
