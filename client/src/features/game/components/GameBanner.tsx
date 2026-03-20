type Props = {
  text: string;
  show: boolean;
  winFlash: boolean;
  variant: "error" | "success" | "info";
};

const styles: Record<Props["variant"], string> = {
  error:
    "border-danger/50 bg-danger-muted text-fg border-l-4 border-l-danger",
  success:
    "border-success/40 bg-success-muted text-fg border-l-4 border-l-success",
  info: "border-accent/35 bg-info-muted text-fg border-l-4 border-l-accent",
};

export function GameBanner({ text, show, winFlash, variant }: Props) {
  if (!show) return null;

  return (
    <div
      className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-relaxed shadow-sm ${styles[variant]} ${
        winFlash ? "animate-win-pop" : ""
      }`}
      role="status"
    >
      {text}
    </div>
  );
}
