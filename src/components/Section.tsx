import type { ReactNode } from "react";

/** Home page section: heading column on the left on desktop, content on the right. */
export default function Section({
  id,
  title,
  aside,
  children,
}: {
  id: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="wrap">
      <div className="grid gap-8 border-t border-rule py-16 md:py-24 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16">
        <div className="grid content-start gap-3">
          <h2 id={`${id}-h`} className="text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[36px]">
            {title}
          </h2>
          {aside}
        </div>
        <div className="grid min-w-0 content-start gap-10">{children}</div>
      </div>
    </section>
  );
}
