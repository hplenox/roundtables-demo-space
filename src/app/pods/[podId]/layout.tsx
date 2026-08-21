"use client";

import { useParams } from "next/navigation";
import { getPodById } from "@/lib/mock-pods";
import { PodProvider } from "./pod-context";

export default function PodRootLayout({ children }: { children: React.ReactNode }) {
  const { podId } = useParams<{ podId: string }>();
  const pod = getPodById(podId);

  // Pod creation and every PODs list/discovery surface are Community-only —
  // a Vendor/Deal POD from existing mock data shouldn't be reachable either.
  if (!pod || pod.kind !== "community") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 text-sm">POD not found.</p>
      </div>
    );
  }

  return <PodProvider initialPod={pod}>{children}</PodProvider>;
}
