export type Block =
  | { p: string }
  | { ul: string[] }
  | { ol: string[] }
  | { note: string }
  | { links: { label: string; href: string }[] }
  | { email: true }
  | { packages: true }
  | { history: true };

export type DocSection = { id: string; h: string; blocks: Block[] };

export type DocPage = {
  title: string;
  description: string;
  eyebrow: string;
  lead: string;
  banner?: string;
  sections: DocSection[];
};
