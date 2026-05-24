"use client";

import { use } from "react";
import { StudioShell } from "@/components/studio/studio-shell";

export default function StudioProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  return <StudioShell projectId={projectId} />;
}
