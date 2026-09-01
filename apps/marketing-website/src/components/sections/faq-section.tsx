import { FaqAccordion } from "@/components/sections/faq-accordion";
import { Reveal } from "@/components/motion/reveal";
import { faqs } from "@/lib/data/faqs";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export function FaqSection() {
  return (
    <section id="faq" className="bg-surface-sunken px-6 py-24 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto grid max-w-[920px] gap-8">
        <Reveal>
          <h2 className="m-0 font-display text-3xl font-extrabold tracking-tight text-text-heading sm:text-4xl">
            Questions, answered
          </h2>
        </Reveal>
        <FaqAccordion />
      </div>
    </section>
  );
}
