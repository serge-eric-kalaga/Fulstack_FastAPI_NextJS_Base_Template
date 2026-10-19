export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">FastAPI + Next.js</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Votre prochain projet commence ici.</h1>
      <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Une base pour construire vos applications fullstack avec TypeScript,
        Tailwind CSS et une API Python.
      </p>
      <nav aria-label="Ressources" className="flex flex-wrap gap-4">
        <a href="http://localhost:8080/docs" className="rounded-lg bg-emerald-700 px-5 py-3 font-medium text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">Documentation de l’API locale</a>
        <a href="https://nextjs.org/docs" className="rounded-lg border border-zinc-400 px-5 py-3 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900">Documentation Next.js</a>
      </nav>
    </main>
  );
}
