import ScoreTile from "@/components/report/ScoreTile";

// Illustrative placeholder data — Evenness is a demo-only, non-per-org metric
// throughout this dashboard.
const EVENNESS_TILES: Array<{ label: string; score: number; percentile: number }> = [
  { label: "Evenness Prime",    score: 1.85, percentile: 78 },
  { label: "Prime · Gender",    score: 0.67, percentile: 52 },
  { label: "Prime · Racial",    score: 1.18, percentile: 92 },
  { label: "Evenness Own.",     score: 1.07, percentile: 81 },
  { label: "Evenness · Gender", score: 0.58, percentile: 68 },
  { label: "Evenness · Racial", score: 0.96, percentile: 90 },
];

// This section always benchmarks vs the RT Universe — it does not shift with
// the Portfolio/RT Universe toggle in PeerBenchmarkComparison.
export default function EvennessScores() {
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[13.5px] font-bold text-slate-800">Evenness scores</h3>
          <span className="text-[11px] text-slate-400">· vs RT Universe</span>
        </div>
        <p className="text-[11px] text-slate-400">Anti-concentration: balance across groups, not just presence</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {EVENNESS_TILES.map((t) => (
          <ScoreTile key={t.label} label={t.label} rawScore={t.score} percentile={t.percentile} />
        ))}
      </div>
    </div>
  );
}
