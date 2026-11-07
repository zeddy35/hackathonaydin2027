/** Text-only wordmark. No symbol. */
export default function Logo() {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
      <span className="text-[16px] font-semibold leading-none tracking-[-0.015em] text-ink sm:text-[18px]">Hackathon Aydın</span>
      <span className="rounded-[4px] border border-accent/25 px-1.5 py-[3px] font-mono text-[11px] font-medium leading-none text-accent">
        2027
      </span>
    </span>
  );
}
