import { Reveal } from "@/components/motion/reveal";
import type { LegalBlock, LegalDoc } from "@/lib/data/legal-content";

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === "subheading") {
    return (
      <span className="mt-1 block text-sm font-bold text-text-heading">{block.text}</span>
    );
  }
  if (block.type === "list") {
    return (
      <ul className="m-0 grid gap-2 pl-5 text-[15px] leading-relaxed text-text-muted">
        {block.items.map((item) => (
          <li key={item} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="m-0 text-[15px] leading-relaxed text-text-muted">{block.text}</p>;
}

/** Renders one legal document (Privacy / Terms / Cookie / IP) as numbered sections — plain prose layout, not marketing card chrome. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <div className="grid max-w-[76ch] gap-10">
      <div className="grid gap-3">
        <h1 className="m-0 font-display text-3xl font-extrabold tracking-tight text-text-heading sm:text-4xl">
          {doc.title}
        </h1>
        <div className="grid gap-2.5">
          {doc.intro.map((block, index) => (
            <LegalBlockView key={index} block={block} />
          ))}
        </div>
      </div>

      <div className="grid gap-8">
        {doc.sections.map((section) => (
          <Reveal key={section.number} distance={12} className="grid gap-3">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-sm font-extrabold text-forest-600">
                {section.number}
              </span>
              <h2 className="m-0 font-display text-xl font-bold text-text-heading">
                {section.heading}
              </h2>
            </div>
            <div className="grid gap-2.5 pl-6">
              {section.blocks.map((block, index) => (
                <LegalBlockView key={index} block={block} />
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
