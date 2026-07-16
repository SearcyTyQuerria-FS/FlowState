import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001";

// TODO (week 4): polish login card spacing and button hover states
function Login() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await fetch(`${API_URL}/api/me`, {
          credentials: "include",
        });

        if (res.ok) {
          navigate("/search", { replace: true });
          return;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    }

    checkLogin();
  }, [navigate]);

  function handleGoogleLogin() {
    window.location.href = `${API_URL}/auth/google`;
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-pf-bg text-pf-text flex items-center justify-center p-6">
        <p className="text-sm text-pf-text-secondary">Checking login...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pf-bg text-pf-text flex items-center justify-center p-6">
      <section className="w-full max-w-md border border-pf-border bg-pf-card rounded-2xl p-8 text-center">
        <header className="mb-6">
          <p className="text-sm text-pf-text-secondary mb-2">
            Spotify companion + mood journal
          </p>
          <h1 id="login-heading" className="text-3xl font-bold text-pf-text">
            Played &amp; Felt
          </h1>
        </header>
        <p className="text-pf-text-secondary text-sm leading-relaxed mb-8">
          Sign in with Google to use the app. Connect Spotify in Settings when
          you want search / music features.
        </p>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-xl bg-[#ead4ad] text-[#1a1208] font-semibold py-3 px-4 hover:opacity-90 transition"
        >
          Continue with Google
        </button>
        <footer className="mt-6 text-xs text-pf-inactive">
          Played &amp; Felt - A portfolio project
        </footer>
      </section>
    </main>
  );
}

export default Login;
