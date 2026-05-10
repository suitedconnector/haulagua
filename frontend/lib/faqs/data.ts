import type { FaqItem } from './types';

// ─── Texas ────────────────────────────────────────────────────────────────────

export const texasFAQs: FaqItem[] = [
  {
    id: 'tx-cost',
    question: 'How much does bulk water delivery cost in Texas?',
    answer:
      'Bulk water delivery in Texas typically costs between $150 and $500 per load, depending on the hauler, distance, water type, and volume. Potable water generally costs more than non-potable water. Most haulers have a minimum fee ranging from $150 to $300. Request quotes from multiple haulers in your area for the best rate.',
    category: 'tx',
  },
  {
    id: 'tx-gallons',
    question: 'How many gallons does a water hauler truck hold in Texas?',
    answer:
      'Most water hauler trucks in Texas carry between 2,000 and 6,000 gallons per load. Smaller medium-duty trucks typically hold 2,000–3,000 gallons, while full-size tanker trucks carry 4,000–6,000 gallons or more. For large jobs like filling a pool or topping off a cistern, haulers may make multiple trips.',
    category: 'tx',
  },
  {
    id: 'tx-pool-fill-time',
    question: 'How long does it take to fill a pool with a water truck in Texas?',
    answer:
      'A standard residential pool (10,000–20,000 gallons) typically requires 2–4 truckloads and can be filled in a few hours to one day, depending on truck size and travel time. Most Texas haulers can complete a pool fill in a single day with proper scheduling.',
    cta: { label: 'Estimate your pool fill with our Water Calculator', href: '/water-calculator' },
    category: 'tx',
  },
  {
    id: 'tx-license',
    question: 'Do Texas water haulers need a license for potable water delivery?',
    answer:
      'Yes. Haulers delivering potable (drinking) water in Texas are required to be licensed by the Texas Commission on Environmental Quality (TCEQ). Always confirm your hauler holds a valid TCEQ potable water carrier license before accepting drinking water delivery.',
    category: 'tx',
  },
  {
    id: 'tx-areas',
    question: 'What areas of Texas have the most water haulers?',
    answer:
      'The highest concentration of bulk water haulers in Texas is found in Central Texas (Austin metro, Hill Country), West Texas (Permian Basin), and the DFW metroplex. Rural counties in East, South, and Far West Texas tend to have fewer haulers, so lead times may be longer in those areas.',
    category: 'tx',
  },
  {
    id: 'tx-emergency',
    question: 'Can I get emergency water delivery in Texas?',
    answer:
      'Yes. Many Texas water haulers offer emergency or same-day delivery for well failures, drought conditions, fire suppression needs, and disaster response. Search for haulers in your city and call directly — most can advise on availability within minutes.',
    category: 'tx',
  },
  {
    id: 'tx-potable-vs-nonpotable',
    question: 'What is the difference between potable and non-potable water delivery?',
    answer:
      'Potable water is safe for human consumption — drinking, cooking, and bathing. Non-potable water is not safe to drink and is used for pool fills (chlorinated separately), dust control, irrigation, and construction. Potable delivery requires a licensed carrier and a food-grade tanker. Always specify which type you need when requesting a quote.',
    category: 'tx',
  },
];

// ─── Arizona ──────────────────────────────────────────────────────────────────

export const arizonaFAQs: FaqItem[] = [
  {
    id: 'az-cost',
    question: 'How much does bulk water delivery cost in Arizona?',
    answer:
      'Bulk water delivery in Arizona typically costs between $150 and $500 per load, depending on the hauler, distance, water type, and volume. Potable water generally costs more than non-potable water. Delivery to remote areas of Maricopa, Pinal, Yavapai, Mohave, or Cochise counties may carry a distance surcharge. Request quotes from multiple haulers in your area for the best rate.',
    category: 'az',
  },
  {
    id: 'az-gallons',
    question: 'How many gallons does a water hauler truck hold in Arizona?',
    answer:
      'Most water hauler trucks in Arizona carry between 2,000 and 6,000 gallons per load. Smaller medium-duty trucks typically hold 2,000–3,000 gallons, while full-size tanker trucks carry 4,000–6,000 gallons or more. For large jobs like filling a pool or supplying a hauled-water home, haulers may make multiple trips.',
    category: 'az',
  },
  {
    id: 'az-pool-fill-time',
    question: 'How long does it take to fill a pool with a water truck in Arizona?',
    answer:
      'A standard residential pool (10,000–20,000 gallons) typically requires 2–4 truckloads and can be filled in a few hours to one day, depending on truck size and travel time. Pool fills are one of the most common requests in the Phoenix metro and Tucson areas, especially heading into Arizona\'s hot summer season.',
    category: 'az',
  },
  {
    id: 'az-license',
    question: 'Do Arizona water haulers need a license for potable water delivery?',
    answer:
      'Yes. Haulers delivering potable (drinking) water in Arizona are required to hold a Water Hauling Permit issued by the Arizona Department of Environmental Quality (ADEQ). Always confirm your hauler holds a valid ADEQ water hauling permit before accepting drinking water delivery.',
    category: 'az',
  },
  {
    id: 'az-areas',
    question: 'What areas of Arizona have the most water haulers?',
    answer:
      'The highest concentration of bulk water haulers in Arizona is found in the Phoenix metro (Maricopa County) and the Tucson area. Rural counties — including Yavapai, Pinal, Mohave, and Cochise — have active hauling markets driven by off-grid homes, ranches, and construction sites that rely on hauled water. Availability may be more limited in remote areas, so plan ahead.',
    category: 'az',
  },
  {
    id: 'az-emergency',
    question: 'Can I get emergency water delivery in Arizona?',
    answer:
      'Yes. Many Arizona water haulers offer emergency or same-day delivery for well failures, monsoon-season flooding damage, fire suppression needs, and summer heat emergencies. Hauled-water homes in rural Maricopa, Yavapai, and Pinal counties depend on regular and emergency deliveries year-round. Search for haulers in your area and call directly — most can advise on availability within minutes.',
    category: 'az',
  },
  {
    id: 'az-potable-vs-nonpotable',
    question: 'What is the difference between potable and non-potable water delivery?',
    answer:
      'Potable water is safe for human consumption — drinking, cooking, and bathing. Non-potable water is not safe to drink and is used for pool fills (chlorinated separately), dust control, irrigation, and construction. In Arizona, dust control is a particularly common use given the desert climate and active construction activity. Potable delivery requires a licensed carrier and a food-grade tanker. Always specify which type you need when requesting a quote.',
    category: 'az',
  },
];

// ─── General / Homepage ───────────────────────────────────────────────────────

export const generalFaqs: FaqItem[] = [
  {
    id: 'what-is-haulagua',
    question: 'What is HaulAgua?',
    answer:
      'HaulAgua is a marketplace that connects property owners, contractors, and homeowners with verified bulk water haulers. Whether you need water for a pool fill, construction site, dust control, or emergency supply, HaulAgua makes it easy to find, compare, and book local haulers.',
    category: 'general',
  },
  {
    id: 'how-it-works',
    question: 'How does HaulAgua work?',
    answer:
      'Search for haulers in your area, view their profiles, pricing, and available services, then request a quote or book directly. Haulers respond quickly and coordinate delivery to your site. Payment is handled securely through the platform.',
    category: 'general',
  },
  {
    id: 'service-areas',
    question: 'What areas does HaulAgua serve?',
    answer:
      "HaulAgua operates across the United States. Enter your zip code or city on the search page to see verified haulers available in your area. Coverage is expanding — if haulers aren't yet available near you, you can sign up to be notified when they arrive.",
    category: 'general',
  },
  {
    id: 'types-of-water',
    question: 'What types of water delivery are available?',
    answer:
      'Haulers on HaulAgua offer potable (drinking-grade) water, non-potable water for construction and dust suppression, swimming pool and hot tub fills, emergency water supply, agricultural and livestock water, and fire suppression support. Available types vary by hauler.',
    category: 'general',
  },
];

export const forCustomersFaqs: FaqItem[] = [
  {
    id: 'how-much-does-it-cost',
    question: 'How much does bulk water delivery cost?',
    answer:
      "Pricing varies by location, volume, water type, and hauler. Most haulers charge per gallon or per load. You'll see pricing details on each hauler's profile, and you can request a free custom quote for larger or recurring orders.",
    category: 'customers',
  },
  {
    id: 'minimum-order',
    question: 'Is there a minimum order size?',
    answer:
      "Minimums are set by individual haulers and typically range from 1,000 to 2,500 gallons. Check each hauler's profile for their specific minimum. Larger orders often qualify for volume discounts.",
    category: 'customers',
  },
  {
    id: 'how-long-delivery',
    question: 'How quickly can water be delivered?',
    answer:
      "Many haulers offer same-day or next-day delivery. Availability depends on the hauler's schedule and your location. You'll see estimated turnaround times during booking, and haulers will confirm your delivery window after booking.",
    category: 'customers',
  },
  {
    id: 'is-water-safe',
    question: 'Is the water safe to use?',
    answer:
      "All haulers on HaulAgua are vetted and must maintain current licenses and insurance. Potable water haulers are held to strict health department standards. Each hauler's profile displays their certifications and water source information so you can make an informed choice.",
    category: 'customers',
  },
];

export const forHaulersFaqs: FaqItem[] = [
  {
    id: 'how-to-list',
    question: 'How do I list my hauling business on HaulAgua?',
    answer:
      'Create a free hauler account, complete your business profile with your service area, equipment, pricing, and certifications, then submit for verification. Once approved, your profile goes live and you start receiving quote requests from customers in your area.',
    category: 'haulers',
  },
  {
    id: 'hauler-fees',
    question: 'What does it cost to be a hauler on HaulAgua?',
    answer:
      'Listing your profile is free. HaulAgua charges a small service fee only on completed bookings made through the platform. There are no monthly subscription fees or upfront costs.',
    category: 'haulers',
  },
  {
    id: 'hauler-requirements',
    question: 'What are the requirements to become a verified hauler?',
    answer:
      "You must hold a valid commercial driver's license (CDL), carry appropriate commercial liability insurance, and comply with all local and state regulations for water transport. Potable water haulers must provide health department permits. We verify all documentation before approving your profile.",
    category: 'haulers',
  },
];

export const homepageFAQs: FaqItem[] = [
  ...generalFaqs,
  forCustomersFaqs[0], // how much does it cost
  forCustomersFaqs[2], // how quickly can water be delivered
  forHaulersFaqs[0],   // how do I list my business
];

export const allFaqs: FaqItem[] = [
  ...generalFaqs,
  ...forCustomersFaqs,
  ...forHaulersFaqs,
];
