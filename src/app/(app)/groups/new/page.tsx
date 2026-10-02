"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { CreateGroupForm, CreateGroupSuccess } from "@/components/create-group-form";

export default function NewGroupPage() {
  const [createdId, setCreatedId] = useState<string | null>(null);

  return <div className="mx-auto max-w-2xl space-y-8">
    <PageHeader eyebrow="New group" title="Create a group" description="Start a private space for your karting crew." />
    {createdId ? <CreateGroupSuccess groupId={createdId} /> : <CreateGroupForm onCreated={() => setCreatedId("grp_1")} />}
  </div>;
}
