import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="w-full py-4 px-5 flex items-center justify-center">
        <span className="font-display font-bold text-xl text-ink">
          <span aria-hidden="true">📱</span> Android Advisor
        </span>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-5 py-4 flex flex-col">
        {children}
      </main>
      <footer className="w-full py-4 px-5 text-center text-sm text-ink-soft">
        Helping you find your perfect Android phone.
      </footer>
    </div>
  );
}
