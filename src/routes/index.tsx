import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { search } from "@/lib/matcher";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SimplyUnusual — jobs for hybrid backgrounds" },
      { name: "description", content: "Type your mix of skills, like nurse + coder, and find roles built for hybrid backgrounds." },
      { property: "og:title", content: "SimplyUnusual — jobs for hybrid backgrounds" },
      { property: "og:description", content: "Find roles that fit your mixed skills. Search stays on your device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const CHIPS = ["nurse + coder", "chef + chemist", "lawyer who codes", "musician & developer", "teacher with a lab background", "agritech", "fintech designer", "food scientist"];

function Index() {
  const [q, setQ] = useState("");
  const { skills, results } = useMemo(() => search(q), [q]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">SimplyUnusual</p>
          <h1 className="mt-2 text-4xl font-black leading-tight md:text-6xl">
            Jobs for <span className="text-primary">hybrid</span> backgrounds.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Two fields, one career. Curated hybrid roles at real Malaysian organisations — describe your mix in your own words.
          </p>
        </header>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. RN who writes Python"
          aria-label="Describe your background"
          className="w-full rounded-xl border-4 border-border bg-card px-5 py-4 text-lg font-semibold shadow-[6px_6px_0_var(--foreground)] outline-none focus:border-primary"
        />
        <p className="mt-2 text-xs text-muted-foreground">Your search stays on your device. Nothing is sent anywhere.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <button key={c} onClick={() => setQ(c)} className="rounded-full border-2 border-border bg-card px-3 py-1 text-sm font-semibold hover:bg-primary">
              {c}
            </button>
          ))}
        </div>

        {skills.length > 0 && (
          <p className="mt-6 text-sm">
            We understood: {skills.map((s) => <span key={s} className="mr-1 rounded bg-primary px-2 py-0.5 font-bold">{s}</span>)}
          </p>
        )}

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {results.map((j) => (
            <article key={j.title} className="rounded-xl border-4 border-border bg-card p-5 shadow-[6px_6px_0_var(--foreground)]">
              {j.score > 1 && <p className="mb-2 text-xs font-black uppercase text-primary">Full match</p>}
              <h2 className="text-xl font-black">{j.title}</h2>
              <p className="text-sm text-muted-foreground">{j.company} · {j.pay}</p>
              <p className="mt-3">{j.why}</p>
              <div className="mt-3 flex gap-2">{j.skills.map((s) => <span key={s} className="rounded border-2 border-border px-2 text-xs font-bold">{s}</span>)}</div>
              <a href="mailto:hello@simplyunusual.example" className="mt-4 inline-block rounded-lg border-2 border-border bg-primary px-4 py-2 font-bold">Apply</a>
            </article>
          ))}
        </section>

        {q.trim() && results.length === 0 && (
          <div className="mt-6 rounded-xl border-4 border-dashed border-border p-6 text-center">
            <p className="text-lg font-black">No matches yet.</p>
            <p className="text-muted-foreground">Try naming two fields, like "baker + biology", or tap a combo above.</p>
          </div>
        )}
      </div>
    </main>
  );
}
