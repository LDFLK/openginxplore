import { ArrowLeft, House } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const REDIRECT_DELAY = 3000;

export default function ErrorPage({ statusCode, title, description, icon: Icon }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/");
    }, REDIRECT_DELAY);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-dark px-4 py-10 text-primary sm:px-6">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />

      <section className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-background shadow-xl shadow-primary/5">
        <div className="h-1 w-full bg-accent" />

        <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
            <Icon aria-hidden="true" className="h-7 w-7" strokeWidth={1.8} />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Error {statusCode}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-primary/60 sm:text-base">
            {description}
          </p>

          <div className="mt-8 flex w-full flex-col-reverse justify-center gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Go back
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-accent bg-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <House aria-hidden="true" className="h-4 w-4" />
              Go to home
            </button>
          </div>

          <div
            className="mt-8 flex items-center gap-2 text-xs text-primary/50"
            aria-live="polite"
          >
            <span>Redirecting to home</span>
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-1 w-1 animate-bounce rounded-full bg-accent" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-accent [animation-delay:100ms]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-accent [animation-delay:200ms]" />
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
