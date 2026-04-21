import { Comms } from "@/components/screens/comms";
import { getRecentComms } from "@/lib/db/queries";

export const revalidate = 15;

export default async function CommsPage() {
  const messages = await getRecentComms(100);
  return <Comms messages={messages} />;
}
