import { Link } from "react-router-dom";

// catch-all for typos/bad links instead of a blank page
function NotFound() {
  return (
    <main className="min-h-screen bg-pf-bg text-pf-text flex items-center justify-center p-6">
      <section className="w-full max-w-md border border-pf-border bg-pf-card rounded-2xl p-8 text-center">
        <p className="text-sm text-pf-text-secondary mb-2">404</p>
        <h1 className="text-2xl font-bold text-pf-text mb-3">
          Page not found
        </h1>
        <p className="text-pf-text-secondary text-sm leading-relaxed mb-8">
          That page doesn&apos;t exist. Might be a typo in the url.
        </p>
        <Link
          to="/today"
          className="inline-block rounded-xl bg-pf-hover border border-pf-border-active text-pf-text font-medium py-3 px-6 transition hover:opacity-90"
        >
          Back to Today
        </Link>
      </section>
    </main>
  );
}

export default NotFound;
