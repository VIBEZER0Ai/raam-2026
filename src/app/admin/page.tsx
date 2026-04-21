import { Admin } from "@/components/screens/admin";
import { getCrewMembers } from "@/lib/db/queries";

type TabId = "members" | "devices" | "audit";
const VALID: TabId[] = ["members", "devices", "audit"];

export const revalidate = 30;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab: TabId = (VALID as string[]).includes(sp.tab ?? "")
    ? (sp.tab as TabId)
    : "members";
  const crew = await getCrewMembers();
  return <Admin tab={tab} crew={crew} />;
}
