export default function ErrorPage({ statusCode, title, description }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background-dark px-4 py-10 text-primary sm:px-6">
      <section
        aria-labelledby="error-title"
        className="flex min-h-[400px] w-full max-w-[720px] flex-col items-center justify-center rounded-xl border border-border bg-background px-6 py-12 text-center shadow-xl shadow-primary/10 sm:min-h-[450px] sm:px-12"
      >
        <p
          aria-hidden="true"
          className="text-[clamp(6rem,20vw,10rem)] font-bold leading-[0.85] tracking-tight text-accent"
        >
          {statusCode}
        </p>

        <div className="mt-9 flex flex-col items-center sm:mt-10">
          <h1
            id="error-title"
            className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl"
          >
            {title}
          </h1>
          <p className="mt-5 max-w-[520px] text-base leading-7 text-primary/55 sm:text-xl sm:leading-8">
            {description}
          </p>
        </div>
      </section>
    </main>
  );
}
