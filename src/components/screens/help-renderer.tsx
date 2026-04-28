/**
 * Renders a HelpArticle.blocks[] tree into accessible HTML with print-clean
 * styles. Used by /help/[slug] and the combined /handbook page.
 */

import { cn } from "@/lib/utils";
import type { Block, HelpArticle } from "@/lib/help/articles";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
} from "lucide-react";

const TONE_CFG = {
  info:   { Icon: Info,           cls: "border-sky-700/50 bg-sky-500/10 text-sky-100" },
  warn:   { Icon: AlertTriangle,  cls: "border-amber-700/50 bg-amber-500/10 text-amber-100" },
  good:   { Icon: CheckCircle2,   cls: "border-emerald-700/50 bg-emerald-500/10 text-emerald-100" },
  danger: { Icon: ShieldAlert,    cls: "border-red-700/60 bg-red-500/10 text-red-100" },
} as const;

export function HelpArticleBody({ article }: { article: HelpArticle }) {
  return (
    <article className="flex flex-col gap-3 text-[14px] leading-[1.55] text-[color:var(--fg-1)] print:text-black">
      <header>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--fg-4)] print:text-zinc-500">
          {article.group} · {article.readMin} min read
        </div>
        <h1 className="mt-1 text-[24px] font-extrabold tracking-tight">
          {article.title}
        </h1>
        <p className="mt-1 text-[13px] text-[color:var(--fg-3)]">
          {article.blurb}
        </p>
      </header>
      {article.blocks.map((b, i) => (
        <BlockRender key={i} block={b} />
      ))}
    </article>
  );
}

function BlockRender({ block }: { block: Block }) {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>;
    case "h":
      return (
        <h2 className="mt-2 text-[16px] font-bold tracking-tight">
          {block.text}
        </h2>
      );
    case "ul":
      return (
        <ul className="ml-4 list-disc space-y-1">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="ml-4 list-decimal space-y-1">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      );
    case "step":
      return (
        <div className="flex gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elev)] p-3 print:border-zinc-300 print:bg-white">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--strava-orange)] text-[11px] font-bold text-white print:bg-zinc-700">
            {block.n}
          </span>
          <div>
            <div className="font-bold">{block.title}</div>
            <p className="mt-0.5 text-[13px] text-[color:var(--fg-2)] print:text-black">
              {block.text}
            </p>
          </div>
        </div>
      );
    case "callout": {
      const { Icon, cls } = TONE_CFG[block.tone];
      return (
        <div
          className={cn(
            "flex gap-2 rounded-lg border p-3 print:border-zinc-300 print:bg-white print:text-black",
            cls,
          )}
        >
          <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            {block.title && (
              <div className="text-[12px] font-bold uppercase tracking-[0.14em]">
                {block.title}
              </div>
            )}
            <p className="text-[13px]">{block.text}</p>
          </div>
        </div>
      );
    }
    case "kv":
      return (
        <div className="overflow-hidden rounded-lg border border-[color:var(--border)] print:border-zinc-300">
          <table className="w-full text-[13px]">
            <tbody>
              {block.rows.map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-[color:var(--border-soft)] last:border-b-0 print:border-zinc-200"
                >
                  <th className="w-[40%] bg-[color:var(--bg-row)] px-3 py-2 text-left text-[12px] font-bold text-[color:var(--fg-2)] print:bg-zinc-50 print:text-black">
                    {r.k}
                  </th>
                  <td className="px-3 py-2 text-[color:var(--fg-1)] print:text-black">
                    {r.v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] p-3 font-mono text-[12px] text-[color:var(--fg-2)] print:border-zinc-300 print:bg-white print:text-black">
          <code>{block.text}</code>
        </pre>
      );
  }
}
