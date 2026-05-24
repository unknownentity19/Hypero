"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useProjects } from "@/lib/projects";

export default function StudioIndexPage() {
  const { user, ready } = useAuth();
  const { projects, ready: projectsReady } = useProjects();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/signin?next=/studio");
      return;
    }
    if (!projectsReady) return;
    // Land on the most recent project, or the dashboard if there are none.
    if (projects.length > 0) {
      router.replace(`/studio/${projects[0]!.id}`);
    } else {
      router.replace("/dashboard?new=1");
    }
  }, [ready, projectsReady, user, projects, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening studio…
    </div>
  );
}
