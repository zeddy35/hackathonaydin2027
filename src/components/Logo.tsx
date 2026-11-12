/**
 * Text-only wordmark. No symbol. `short` is the phone header version: "HA" and the year badge,
 * read as the full name by screen readers.
 */
export default function Logo({ short = false }: { short?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
      {short ? (
        <span className="poster text-[24px] leading-none text-ink">
          <span aria-hidden="true">HA</span>
          <span className="sr-only">Hackathon Aydın</span>
        </span>
      ) : (
        <span className="poster text-[19px] leading-none text-ink sm:text-[22px]">
          Hackathon <span className="text-accent-ink">Aydın</span>
        </span>
      )}{" "}
      <span className="logo-year rounded-[4px] border border-accent/60 bg-accent-tint px-1.5 py-[3px] font-mono text-[11px] font-medium leading-none text-accent-ink transition-colors duration-200 group-hover/logo:border-accent group-hover/logo:bg-accent group-hover/logo:text-on-accent">
        2027
      </span>
    </span>
  );
}
