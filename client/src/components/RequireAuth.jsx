import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { API_URL } from "../config";

// keeps /today /search /settings behind google login
function RequireAuth() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_URL}/api/me`, {
          credentials: "include",
        });
        setLoggedIn(res.ok);
      } catch (err) {
        console.error(err);
        setLoggedIn(false);
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen bg-pf-bg text-pf-text flex items-center justify-center p-6">
        <p className="text-sm text-pf-text-secondary">Checking login...</p>
      </main>
    );
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default RequireAuth;
