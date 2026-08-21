import { avatarStyle, initialsOf } from "@/lib/mock-pods";

const SIZE_CLASSES: Record<"xs" | "sm" | "md", string> = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-[13px]",
};

export default function PodAvatar({
  name,
  size = "sm",
  ring = false,
}: {
  name: string;
  size?: "xs" | "sm" | "md";
  ring?: boolean;
}) {
  const style = avatarStyle(name);
  return (
    <div
      className={`shrink-0 rounded-full flex items-center justify-center font-bold ${style.bg} ${style.text} ${SIZE_CLASSES[size]} ${
        ring ? "ring-2 ring-white" : ""
      }`}
      title={name}
    >
      {initialsOf(name)}
    </div>
  );
}

export function AvatarStack({ names, size = "xs", max = 3 }: { names: string[]; size?: "xs" | "sm" | "md"; max?: number }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((n, i) => (
        <PodAvatar key={`${n}-${i}`} name={n} size={size} ring />
      ))}
      {extra > 0 && (
        <div className={`shrink-0 rounded-full flex items-center justify-center font-bold bg-slate-200 text-slate-600 ring-2 ring-white ${SIZE_CLASSES[size]}`}>
          +{extra}
        </div>
      )}
    </div>
  );
}
