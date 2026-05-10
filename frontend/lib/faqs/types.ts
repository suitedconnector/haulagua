export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  /** Optional inline call-to-action rendered below the answer text */
  cta?: { label: string; href: string };
  category?: string;
};

export type FaqSectionProps = {
  title?: string;
  subtitle?: string;
  faqs: FaqItem[];
  /** Accordion item id to open by default */
  defaultOpen?: string;
  className?: string;
};
