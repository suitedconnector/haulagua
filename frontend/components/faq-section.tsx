'use client';

import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FaqSectionProps } from '@/lib/faqs/types';

export function FaqSection({
  title = 'Frequently Asked Questions',
  subtitle,
  faqs,
  defaultOpen,
  className = '',
}: FaqSectionProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <section
      className={`bg-[#F8F9FA] py-16 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="mx-auto max-w-3xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <div className="mb-10 text-center">
          <h2
            className="text-3xl font-bold tracking-tight text-[#005A9C] sm:text-4xl"
            style={{ fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="mt-3 text-base text-[#333333]/70"
              style={{ fontFamily: 'var(--font-lato, Lato, sans-serif)' }}
            >
              {subtitle}
            </p>
          )}
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#F2A900]" />
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue={defaultOpen}
          className="divide-y divide-[#005A9C]/10 rounded-xl border border-[#005A9C]/10 bg-white shadow-sm"
        >
          {faqs.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-b-0 px-6 last:rounded-b-xl first:rounded-t-xl"
            >
              <AccordionTrigger
                className="text-left text-base font-semibold text-[#333333] hover:text-[#005A9C] hover:no-underline [&[data-state=open]]:text-[#005A9C]"
                style={{ fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}
              >
                {item.question}
              </AccordionTrigger>
              <AccordionContent
                className="text-[#333333]/80 leading-relaxed"
                style={{ fontFamily: 'var(--font-lato, Lato, sans-serif)' }}
              >
                {item.answer}
                {item.cta && (
                  <Link
                    href={item.cta.href}
                    className="mt-3 inline-block text-sm font-semibold text-[#005A9C] hover:underline"
                    style={{ fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}
                  >
                    {item.cta.label} →
                  </Link>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
