export default function PodSparkline({ values, color = "#4361ee" }: { values: number[]; color?: string }) {
  return (
    <div className="flex items-end gap-[3px] h-6">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full"
          style={{ height: `${Math.max(8, v * 100)}%`, background: color, opacity: 0.35 + v * 0.65 }}
        />
      ))}
    </div>
  );
}
