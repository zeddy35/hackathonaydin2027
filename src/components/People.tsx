import Image from "next/image";
import type { Person } from "@/data/types";

/** Renders nothing when the list is empty; never shows placeholder profiles. */
export default function People({ people, title }: { people: Person[]; title: string }) {
  if (people.length === 0) return null;
  return (
    <div className="grid gap-4">
      <h3 className="label">{title}</h3>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => {
          const body = (
            <>
              {p.photo && (
                <Image src={p.photo} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover" />
              )}
              <span className="grid">
                <span className="font-semibold">{p.name}</span>
                <span className="text-[15px] text-muted">
                  {p.role}
                  {p.org ? `, ${p.org}` : ""}
                </span>
              </span>
            </>
          );
          return (
            <li key={p.id} className="flex items-center gap-4">
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:underline">
                  {body}
                </a>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
