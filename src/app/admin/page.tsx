import { Admin } from "@/components/screens/admin";

type TabId = "members" | "devices" | "audit";
const VALID: TabId[] = ["members", "devices", "audit"];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab: TabId = (VALID as string[]).includes(sp.tab ?? "")
    ? (sp.tab as TabId)
    : "members";
  return <Admin tab={tab} />;
}
