import Link from "next/link";
import {
  HELP_ARTICLES,
  HELP_GROUPS,
  type HelpArticle,
} from "@/lib/help/articles";
import { Card, CardBody, CardHead } from "@/components/ui/card";
import { BookOpen, Download, Search } from "lucide-react";

export default function HelpIndexPage() {
  const byGroup = HELP_GROUPS.map((g) => ({
    group: g,
    articles: HELP_ARTICLES.filter((a) => a.group === g.id),
  }));

  return (
    <div className="flex flex-col gap-3.5">
      <Card>
        <CardHead
          left={
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[color:var(--strava-orange)]" />
              Help center
            </span>
          }
          right={
            <Link
              href="/handbook"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--fg-2)] hover:border-[color:var(--strava-orange)] hover:text-[color:var(--strava-orange)]"
            >
              <Download className="h-3.5 w-3.5" />
              Print / PDF
            </Link>
          }
        />
        <CardBody>
          <div className="text-[13px] text-[color:var(--fg-2)]">
            New to Ventor? Start with{" "}
            <Link
              href="/help/quick-start"
              className="font-bold text-[color:var(--strava-orange)] hover:underline"
            >
              Quick start
            </Link>{" "}
            — five minutes and you&apos;ll know where every screen lives.
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] text-[color:var(--fg-3)] sm:grid-cols-2 md:grid-cols-3">
            <CountCell label="Articles" value={`${HELP_ARTICLES.length}`} />
            <CountCell
              label="Total read"
              value={`~${HELP_ARTICLES.reduce((a, x) => a + x.readMin, 0)} min`}
            />
            <CountCell label="Topics" value={`${HELP_GROUPS.length}`} />
          </div>
        </CardBody>
      </Card>

      {byGroup.map(({ group, articles }) => (
        <Card key={group.id}>
          <CardHead left={group.label} right={group.desc} />
          <div className="flex flex-col">
            {articles.map((a) => (
              <ArticleRow key={a.slug} a={a} />
            ))}
          </div>
        </Card>
      ))}

      <Card>
        <CardHead
          left={
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[color:var(--fg-3)]" />
              Can&apos;t find what you need?
            </span>
          }
          right="ai bot · coming"
        />
        <CardBody>
          <div className="text-[13px] text-[color:var(--fg-2)]">
            An in-app Q&amp;A bot is on the way (AA6.18). For now, ping the
            crew chief on the Main WhatsApp group, or open a GitHub issue
            against the Ventor repo if you spot something missing.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function ArticleRow({ a }: { a: HelpArticle }) {
  return (
    <Link
      href={`/help/${a.slug}`}
      className="flex items-start justify-between gap-3 border-b border-[color:var(--border-soft)] px-4 py-3 last:border-b-0 hover:bg-[color:var(--bg-row)]"
    >
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold text-[color:var(--fg-1)]">
          {a.title}
        </div>
        <div className="mt-0.5 text-[12px] text-[color:var(--fg-3)]">
          {a.blurb}
        </div>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--fg-4)]">
        {a.readMin} min
      </div>
    </Link>
  );
}

function CountCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] px-3 py-2">
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[color:var(--fg-4)]">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[15px] font-bold text-[color:var(--fg-1)]">
        {value}
      </div>
    </div>
  );
}
