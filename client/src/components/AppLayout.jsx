import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function AppLayout() {
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `block rounded-xl px-3 py-2 text-sm transition whitespace-nowrap ${
      isActive
        ? "bg-pf-hover text-pf-text border border-pf-border-active"
        : "text-pf-text-secondary hover:bg-pf-hover hover:text-pf-text"
    }`;

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-pf-bg text-pf-text md:grid md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col border-b border-pf-border bg-pf-sidebar p-4 md:border-b-0 md:border-r">
        <header className="mb-4 px-2 md:mb-6">
          <p className="text-lg font-bold text-pf-text">Played &amp; Felt</p>
          <p className="mt-1 text-xs text-pf-inactive">
            Spotify companion + mood journal
          </p>
        </header>

        <nav aria-label="Main">
          {/* scrolls sideways on phone instead of wrapping to multiple rows, stacks on desktop */}
          <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:space-y-1 md:gap-0 md:overflow-visible md:pb-0">
            <li className="shrink-0">
              <NavLink to="/today" className={linkClass}>
                Today
              </NavLink>
            </li>
            <li className="shrink-0">
              <NavLink to="/search" className={linkClass}>
                Search
              </NavLink>
            </li>
            <li className="shrink-0">
              <NavLink to="/timeline" className={linkClass}>
                Timeline
              </NavLink>
            </li>
            <li className="shrink-0">
              <NavLink to="/insights" className={linkClass}>
                Insights
              </NavLink>
            </li>
            <li className="shrink-0">
              <NavLink to="/settings" className={linkClass}>
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="mt-4 flex items-center justify-between gap-3 px-2 md:mt-auto md:block md:space-y-3 md:pt-8">
          <p className="hidden text-xs leading-relaxed text-pf-inactive md:block">
            Timeline + Insights are placeholders for now (after class).
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-pf-text-secondary hover:text-pf-danger"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
