import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Printer } from "lucide-react";
import { getArticle, HELP_ARTICLES } from "@/lib/help/articles";
import { HelpArticleBody } from "@/components/screens/help-renderer";

export function generateStaticParams() {
  return HELP_ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  // Cross-link to next + previous in the same group for sequential reading.
  const sameGroup = HELP_ARTICLES.filter((a) => a.group === article.group);
  const idx = sameGroup.findIndex((a) => a.slug === slug);
  const prev = idx > 0 ? sameGroup[idx - 1] : null;
  const next = idx < sameGroup.length - 1 ? sameGroup[idx + 1] : null;

  return (
    <div className="flex flex-col gap-3.5 print:gap-2">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[color:var(--fg-3)] hover:text-[color:var(--fg-1)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All articles
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-5 print:border-0 print:p-0">
        <HelpArticleBody article={article} />
      </div>

      <div className="grid gap-2 print:hidden md:grid-cols-2">
        {prev ? (
          <Link
            href={`/help/${prev.slug}`}
            className="flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3 hover:border-[color:var(--border-strong)]"
          >
            <ArrowLeft className="h-4 w-4 text-[color:var(--fg-4)]" />
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--fg-4)]">
                Previous
              </div>
              <div className="truncate text-[13px] font-bold text-[color:var(--fg-1)]">
                {prev.title}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next && (
          <Link
            href={`/help/${next.slug}`}
            className="flex items-center justify-end gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3 text-right hover:border-[color:var(--border-strong)]"
          >
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--fg-4)]">
                Next
              </div>
              <div className="truncate text-[13px] font-bold text-[color:var(--fg-1)]">
                {next.title}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[color:var(--fg-4)]" />
          </Link>
        )}
      </div>
    </div>
  );
}

function PrintButton() {
  // Server-component-friendly: lean on the browser's window.print() via a
  // tiny client component would be cleaner; for now hint at the keyboard
  // shortcut and rely on the /handbook page for full-print mode.
  return (
    <Link
      href="/handbook"
      className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--fg-2)] hover:border-[color:var(--strava-orange)] hover:text-[color:var(--strava-orange)]"
    >
      <Printer className="h-3.5 w-3.5" />
      Print full book
    </Link>
  );
}
