type Props = {
  wsOpen: boolean;
  joined: boolean;
  message: string;
};

export function ConnectionStatus({ wsOpen, joined, message }: Props) {
  const tone = !wsOpen ? "danger" : joined ? "success" : "accent";
  const dot =
    tone === "danger"
      ? "bg-danger"
      : tone === "success"
        ? "bg-success"
        : "bg-accent animate-pulse-soft";

  return (
    <div
      className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-surface-2/80 px-4 py-3 text-sm leading-snug text-muted backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <span
        className={`mt-1.5 size-2.5 shrink-0 rounded-full ${dot}`}
        aria-hidden
      />
      <p className="min-w-0 flex-1 text-fg/90">{message}</p>
    </div>
  );
}
