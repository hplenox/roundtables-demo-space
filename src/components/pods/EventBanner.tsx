/**
 * Cover banner for an event, matching the platform's event page hero.
 * A CSS gradient stands in for an uploaded cover photo in this demo.
 */
export default function EventBanner({
  className = "",
  heightClassName = "h-56 sm:h-64",
  rounded = true,
}: {
  className?: string;
  heightClassName?: string;
  rounded?: boolean;
}) {
  return (
    <div
      className={`w-full ${heightClassName} ${rounded ? "rounded-lg" : ""} overflow-hidden relative ${className}`}
      style={{
        background:
          "linear-gradient(180deg, #1b2a4a 0%, #16233d 45%, #0e1729 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 0%, rgba(67,97,238,0.18) 35%, transparent 60%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-2/3"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 14px, transparent 14px, transparent 34px)",
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />
    </div>
  );
}
