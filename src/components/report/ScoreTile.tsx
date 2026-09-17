import { pctColor, ordinal } from "@/components/report/benchmarkFormat";

export default function ScoreTile({
  label, rawScore, percentile,
}: {
  label: string; rawScore: number; percentile: number | null;
}) {
  const color = pctColor(percentile);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 pt-3.5 pb-3 flex flex-col">
      <p className="text-[10.5px] font-semibold text-slate-500 mb-1 leading-tight">{label}</p>
      <p className="text-[20px] font-bold text-slate-900 leading-none tabular-nums mb-1">
        {rawScore.toFixed(2)}
      </p>
      <p className="text-[11.5px] font-bold mb-2 tabular-nums" style={{ color }}>
        {percentile === null ? "—" : ordinal(percentile)}
      </p>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        {percentile !== null && (
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentile}%`, backgroundColor: color }} />
        )}
      </div>
    </div>
  );
}
