/** Text-only wordmark. No symbol. */
export default function Logo() {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
      <span className="poster text-[19px] leading-none text-ink sm:text-[22px]">
        Hackathon <span className="text-accent">Aydın</span>
      </span>{" "}
      <span className="logo-year rounded-[4px] border border-accent/40 px-1.5 py-[3px] font-mono text-[11px] font-medium leading-none text-accent transition-colors duration-200 group-hover/logo:border-accent group-hover/logo:bg-accent group-hover/logo:text-on-accent">
        2027
      </span>
    </span>
  );
}
