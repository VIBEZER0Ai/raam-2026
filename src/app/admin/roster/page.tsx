import { CrewEditor } from "@/components/screens/crew-editor";
import { getCrewMembers } from "@/lib/db/queries";

export const revalidate = 15;

export default async function RosterPage() {
  const crew = await getCrewMembers({ includeInactive: true });
  return <CrewEditor crew={crew} />;
}
