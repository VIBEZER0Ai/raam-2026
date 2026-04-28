/**
 * /handbook — print-optimized one-page combined view of the entire help corpus.
 *
 * Browser → Save as PDF turns this into a downloadable handbook. Crew can
 * print it for the follow vehicle's glove-box backup.
 */

import {
  HELP_ARTICLES,
  HELP_GROUPS,
  type HelpArticle,
} from "@/lib/help/articles";
import { HelpArticleBody } from "@/components/screens/help-renderer";
import { PrintButton } from "@/components/screens/print-button";

export default function HandbookPage() {
  const byGroup = HELP_GROUPS.map((g) => ({
    group: g,
    articles: HELP_ARTICLES.filter((a) => a.group === g.id),
  }));

  return (
    <div className="flex flex-col gap-6 print:gap-4">
      <header className="flex items-start justify-between gap-3 border-b border-[color:var(--border)] pb-3 print:border-zinc-300">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--fg-4)] print:text-zinc-500">
            Operator handbook · Ventor · v1
          </div>
          <h1 className="mt-1 text-[30px] font-extrabold tracking-tight">
            How Ventor works
          </h1>
          <p className="mt-1 text-[13px] text-[color:var(--fg-3)] print:text-zinc-700">
            For crews moving from pen-and-paper to a shared dashboard. Print
            this for the follow vehicle&apos;s glove box.
          </p>
        </div>
        <PrintButton />
      </header>

      <nav className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-4 print:border-zinc-300 print:bg-white">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--fg-4)] print:text-zinc-500">
          Table of contents
        </div>
        <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-[13px]">
          {byGroup.flatMap(({ group, articles }) => [
            <li key={`g-${group.id}`} className="mt-2 list-none font-bold uppercase tracking-[0.12em] text-[color:var(--fg-2)] print:text-black">
              {group.label}
            </li>,
            ...articles.map((a) => (
              <li key={a.slug}>
                <a
                  href={`#${a.slug}`}
                  className="text-[color:var(--fg-1)] hover:underline print:text-black"
                >
                  {a.title}
                </a>{" "}
                <span className="text-[color:var(--fg-4)] print:text-zinc-500">
                  · {a.readMin} min
                </span>
              </li>
            )),
          ])}
        </ol>
      </nav>

      {byGroup.flatMap(({ group, articles }) => [
        <div key={`gh-${group.id}`} className="break-after-page pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--fg-4)] print:text-zinc-500">
            Section
          </div>
          <h2 className="mt-1 text-[22px] font-extrabold tracking-tight">
            {group.label}
          </h2>
          <p className="text-[13px] text-[color:var(--fg-3)]">{group.desc}</p>
        </div>,
        ...articles.map((a: HelpArticle) => (
          <section
            key={a.slug}
            id={a.slug}
            className="break-inside-avoid rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-5 print:border-0 print:bg-white print:p-0"
          >
            <HelpArticleBody article={a} />
          </section>
        )),
      ])}

      <footer className="border-t border-[color:var(--border)] pt-3 text-[10px] text-[color:var(--fg-4)] print:border-zinc-300 print:text-zinc-500">
        Generated from src/lib/help/articles.tsx · Ventor handbook · keep this
        copy in the follow vehicle.
      </footer>

      <style>{`
        @media print {
          html, body { background: white !important; color: black !important; }
          a { color: black !important; text-decoration: none; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 18mm 16mm; }
        }
      `}</style>
    </div>
  );
}
