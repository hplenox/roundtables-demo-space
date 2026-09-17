import type { InvitedOrg, BenchmarkPool } from "@/types/survey";
import PeerBenchmarkComparison from "@/components/report/PeerBenchmarkComparison";
import LpiSubComponentScores from "@/components/report/LpiSubComponentScores";
import EvennessScores from "@/components/report/EvennessScores";

// Section 2 of the manager report. Split into three pieces so it's clear which
// ones react to the RT Universe / My Portfolio toggle and which don't:
// - PeerBenchmarkComparison: the toggle, filters, percentile stat, and gauge — shifts.
// - LpiSubComponentScores / EvennessScores: always benchmarked vs RT Universe — static.
export default function BenchmarksCard({
  org,
  benchmarkPools,
}: {
  org: InvitedOrg;
  benchmarkPools: { key: string; data: BenchmarkPool }[];
}) {
  return (
    <div className="space-y-5">
      <PeerBenchmarkComparison org={org} benchmarkPools={benchmarkPools} />
      <div className="border-t border-slate-100" />
      <LpiSubComponentScores org={org} />
      <div className="border-t border-slate-100" />
      <EvennessScores />
    </div>
  );
}
