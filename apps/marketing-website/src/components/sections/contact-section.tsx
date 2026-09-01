import Link from "next/link";
import { Icon } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/sections/contact-form";
import { SectionShell } from "@/components/sections/section-shell";
import { siteConfig } from "@/lib/site-config";

const socialLinks: {
  label: string;
  href: string;
  icon: "globe" | "play" | "camera";
}[] = [
  { label: "LinkedIn", href: siteConfig.social.linkedin, icon: "globe" },
  { label: "Instagram", href: siteConfig.social.instagram, icon: "camera" },
];

export function ContactSection() {
  return (
    <SectionShell id="contact" gap="gap-12">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1fr]">
        <Reveal className="grid content-start gap-5">
          <h2 className="m-0 max-w-[34ch] text-wrap-pretty font-display text-3xl leading-tight font-extrabold tracking-tight text-text-heading sm:text-4xl">
            Have an idea, a question, or a school to bring on board?
          </h2>
          <div className="grid gap-3">
            <a
              href={`mailto:${siteConfig.emails.general}`}
              className="flex items-center gap-2.5 text-base"
            >
              <Icon name="mail" size={18} />
              {siteConfig.emails.general}
            </a>
            <span className="flex items-center gap-2.5 text-base text-text-body">
              <Icon name="building-2" size={18} />
              Institute partnerships — {siteConfig.emails.institutes}
            </span>
            <span className="flex items-center gap-2.5 text-base text-text-body">
              <Icon name="presentation" size={18} />
              Teach on Lurniva — {siteConfig.emails.teachers}
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="inline-flex h-11 items-center gap-2 rounded-pill border border-border-subtle bg-surface-card px-4 text-sm font-semibold text-primary"
              >
                <Icon name={social.icon} size={16} />
                {social.label}
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </SectionShell>
  );
}
