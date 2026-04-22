import { SleepTracker } from "@/components/screens/sleep-tracker";
import { getAwakeStatus, getRecentRestLogs } from "@/lib/db/queries";

export const revalidate = 15;

export default async function SleepPage() {
  const [status, history] = await Promise.all([
    getAwakeStatus(),
    getRecentRestLogs(30),
  ]);
  return <SleepTracker status={status} history={history} />;
}
