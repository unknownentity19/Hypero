"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createProject, useProjects } from "@/lib/projects";

export default function StudioIndexPage() {
  const { projects, ready } = useProjects();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (!ready || handled.current) return;
    handled.current = true;
    if (projects.length > 0) {
      router.replace(`/studio/${projects[0]!.id}`);
    } else {
      // No projects yet — scaffold one so the studio always opens directly.
      const p = createProject({
        name: "Untitled project",
        description: "Your first visual AI workflow.",
        template: "lead-router",
      });
      router.replace(`/studio/${p.id}`);
    }
  }, [ready, projects, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening studio…
    </div>
  );
}
