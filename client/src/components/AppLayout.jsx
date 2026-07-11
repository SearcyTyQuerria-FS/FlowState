import { NavLink, Outlet } from "react-router-dom";

function AppLayout() {
  const linkClass = ({ isActive }) =>
    `block rounded-xl px-3 py-2 text-sm transition ${
      isActive
        ? "bg-pf-hover text-pf-text border border-pf-border-active"
        : "text-pf-text-secondary hover:bg-pf-hover hover:text-pf-text"
    }`;

  return (
    <div className="min-h-screen bg-pf-bg text-pf-text md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-pf-border md:border-b-0 md:border-r bg-[#120e09] p-4">
        <header className="mb-6 px-2">
          <p className="text-lg font-bold text-pf-text">Played &amp; Felt</p>
          <p className="text-xs text-pf-inactive mt-1">
            Spotify companion + mood journal
          </p>
        </header>

        <nav aria-label="Main">
          <ul className="space-y-1">
            <li>
              <NavLink to="/today" className={linkClass}>
                Today
              </NavLink>
            </li>
            <li>
              <NavLink to="/search" className={linkClass}>
                Search
              </NavLink>
            </li>
            <li>
              <NavLink to="/timeline" className={linkClass}>
                Timeline
              </NavLink>
            </li>
            <li>
              <NavLink to="/insights" className={linkClass}>
                Insights
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={linkClass}>
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>

        <p className="mt-8 px-2 text-xs text-pf-inactive leading-relaxed">
          Timeline + Insights are placeholders for now (after class).
        </p>
      </aside>

      <main className="p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
