import type { ReactNode } from 'react';
import './credits.css';

type View = 'home' | 'credits';

type Props = {
  active: View;
  onNavigate: (view: View) => void;
  children: ReactNode;
};

export function AppLayout({ active, onNavigate, children }: Props) {
  return (
    <div className="app-shell">
      <header className="app-shell__nav">
        <nav className="app-shell__menu" aria-label="Menu principal">
          <button
            type="button"
            className={`app-shell__tab${active === 'home' ? ' app-shell__tab--active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            Início
          </button>
          <button
            type="button"
            className={`app-shell__tab${active === 'credits' ? ' app-shell__tab--active' : ''}`}
            onClick={() => onNavigate('credits')}
          >
            Créditos
          </button>
        </nav>
      </header>
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
