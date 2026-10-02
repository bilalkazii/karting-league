import { notFound } from "next/navigation";
import { getGroupById } from "@/lib/repositories/groups";
import { getGroupMembers } from "@/lib/repositories/members";
import { GroupHeader } from "@/components/group-header";
import { GroupTabs } from "@/components/group-tabs";

export default async function GroupLayout({ params, children }: { params: Promise<{ groupId: string }>; children: React.ReactNode }) {
  const { groupId } = await params;
  const group = await getGroupById(groupId);
  if (!group) notFound();

  const members = await getGroupMembers(groupId);

  return <div className="space-y-6">
    <GroupHeader group={group} memberCount={members.length} />
    <GroupTabs groupId={groupId} />
    {children}
  </div>;
}
