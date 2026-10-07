import { Link, NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/" className="app-wordmark">
            Reiseplaner
          </Link>
          <nav className="app-nav" aria-label="Hauptnavigation">
            <NavLink to="/" end className="app-nav__link">
              Reisen
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
