import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

/**
 * SLUG STRATEGY (SEO-focused, not title-based)
 * Route: /blog/bulk-water-delivery
 * 
 * HaulAgua Blog Slug Patterns:
 * - /bulk-water-delivery (main keyword, high intent)
 * - /pool-filling (service category)
 * - /construction-water (use case)
 * - /emergency-water-delivery (service type with urgency intent)
 * - /bulk-water-pricing (intent: cost estimation)
 * 
 * Rule: Slugs target primary search keywords, not creative titles.
 * The h1 title can be descriptive; the slug stays concise & keyword-focused.
 */

export const metadata: Metadata = {
  title: 'Bulk Water Delivery Guide: Potable & Non-Potable Services | HaulAgua',
  description: 'Complete guide to bulk water delivery services. Learn about potable vs non-potable water, pricing factors, booking process, and use cases for residential, commercial, and emergency delivery.',
  keywords: ['bulk water delivery', 'potable water', 'non-potable water', 'pool filling', 'dust control', 'emergency water'],
  openGraph: {
    title: 'Bulk Water Delivery Services Guide',
    description: 'Everything you need to know about bulk water delivery — from pricing and booking to site preparation.',
    type: 'article',
    publishedTime: new Date('2024-01-15').toISOString(),
    authors: ['HaulAgua Editorial'],
  },
};

const BlogPostPage: React.FC = () => {
  return (
    <article className="min-h-screen bg-[#F8F9FA]">
      {/* Header Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#005A9C] hover:text-[#003d6b] transition-colors">
            <ChevronLeft size={20} />
            <span className="font-lato text-base">Back to Blog</span>
          </Link>
        </div>
      </nav>

      {/* Article Container */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header Section */}
        <header className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-block bg-[#F2A900] px-3 py-1 rounded-full font-montserrat text-xs font-semibold text-white">
              Water Delivery Guide
            </span>
          </div>
          
          <h1 className="font-montserrat text-5xl font-bold text-[#333333] leading-tight mb-4">
            Complete Guide to Bulk Water Delivery Services
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 font-lato">
            <span>Published January 15, 2024</span>
            <span>•</span>
            <span>15 min read</span>
            <span>•</span>
            <span>HaulAgua Editorial</span>
          </div>
        </header>

        {/* Table of Contents */}
        <aside className="mb-12 bg-white p-6 rounded-lg border-l-4 border-[#005A9C]">
          <h2 className="font-montserrat text-lg font-semibold text-[#333333] mb-4">Table of Contents</h2>
          <ul className="space-y-2 font-lato text-[#005A9C]">
            <li><a href="#what-is" className="hover:underline">What is Bulk Water Delivery?</a></li>
            <li><a href="#potable-vs" className="hover:underline">Potable vs Non-Potable Water</a></li>
            <li><a href="#use-cases" className="hover:underline">Common Use Cases</a></li>
            <li><a href="#pricing" className="hover:underline">Pricing & Cost Factors</a></li>
            <li><a href="#booking" className="hover:underline">How to Book Delivery</a></li>
          </ul>
        </aside>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none font-lato text-[#333333]">
          {/* Introduction */}
          <section id="what-is" className="mb-10">
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              Bulk water delivery is the trucked transportation of water in huge quantities—typically 2,000 to 6,000+ gallons per load—for commercial, residential, industrial, and emergency purposes. Bulk water delivery can be used for projects and situations that demand fast access to large volumes of water when municipal supply is unavailable, interrupted or insufficient, as opposed to bottled water or small volume office cooler services.
            </p>
            
            <p className="text-lg leading-relaxed text-gray-700">
              There are two main types: <strong>potable water</strong>, which has been processed, certified and is safe to drink (used in drilling camps, food establishments, hospitals and emergency situations), and <strong>non-potable water</strong>, which is suitable for dust control on construction sites, soil compaction, landscaping and other uses where drinking water quality is not required. Various types require different handling techniques, equipment sanitization standards and regulatory compliance.
            </p>
          </section>

          {/* Quick Answer Box */}
          <section className="my-12 bg-blue-50 border-l-4 border-[#005A9C] p-6 rounded">
            <h2 className="font-montserrat text-2xl font-bold text-[#333333] mb-4">Quick Answer: What We Deliver, Who It's For, How Fast, and How Quotes Work</h2>
            
            <p className="mb-4 text-gray-700">
              Bulk water distribution is the solution for fast access to big amounts of water when traditional supply is not available or feasible. Typical truckload volumes are 2,000 to 6,000 gallons, with larger tanker units available for large volume industrial and emergency applications. Most established carriers will transport same-day or next-day within their covered service areas and have 24/7 emergency hotlines for crucial potable water situations.
            </p>

            <h3 className="font-montserrat font-semibold text-[#333333] mb-3 mt-4">Key service parameters include:</h3>
            <ul className="space-y-3 ml-4">
              <li><strong>Load capacity:</strong> 2,000–6,000 gallons per standard truck; 8,000–12,000 gallon tankers for large projects</li>
              <li><strong>Primary applications:</strong> Construction dust suppression and compaction, pool and cistern filling, emergency potable supply, event support, agricultural irrigation</li>
              <li><strong>Response time:</strong> Same-day or next-day in most metro and rural zones; priority emergency dispatch available 24/7</li>
              <li><strong>Pricing factors:</strong> Total gallons required, potable certification requirements, travel distance and zone pricing, site access complexity and standby time, after-hours or rapid-response premiums, volume discounts for multi-load contracts</li>
              <li><strong>Booking process:</strong> Online quote request or phone dispatch with address, volume, water type, timing, and access details</li>
            </ul>
          </section>

          {/* Potable vs Non-Potable */}
          <section id="potable-vs" className="mb-10">
            <h2 className="font-montserrat text-3xl font-bold text-[#333333] mb-4">Services at a Glance: Potable vs Non‑Potable</h2>
            
            <p className="mb-6 text-gray-700">
              It is important to understand potable versus non-potable water for compliance, safety and cost reasons. Each category has its own handling criteria, equipment norms and regulatory supervision.
            </p>

            <h3 className="font-montserrat text-xl font-bold text-[#333333] mb-3">Drinking Water Supply (Potable)</h3>
            <p className="mb-4 text-gray-700">
              Potable water is processed, tested and certified safe for human consumption. This meets EPA drinking water guidelines and state health agency limits. Potable water is provided in dedicated and sanitized tanks with food-grade hose and includes chain-of-custody documents and water quality test certificates.
            </p>
            <p className="mb-6 text-gray-700">
              <strong>Typical drinking water applications include:</strong> Remote job sites and drilling camps, food service and beverage production facilities, hospitals and healthcare facilities in emergencies, schools and public buildings, disaster relief and temporary housing, residential use during well contamination or municipal outages.
            </p>

            <h3 className="font-montserrat text-xl font-bold text-[#333333] mb-3">Non-Potable Water Supply</h3>
            <p className="mb-4 text-gray-700">
              Non-potable water is fit for use where human consumption is not a concern. This is suitable for dust control on construction sites, soil compaction, landscaping, equipment washing, and other industrial applications. Non-potable deliveries cost 30-50% less than potable water due to reduced sanitization and certification requirements.
            </p>

            <div className="bg-amber-50 border border-[#F2A900] p-4 rounded mb-6 mt-6">
              <h4 className="font-montserrat font-semibold text-[#333333] mb-2">What Bulk Water Delivery Is NOT</h4>
              <p className="text-gray-700 text-sm">
                We are NOT a bottled water company or 5-gallon office cooler delivery service. Our bulk water delivery by truck is NOT a comparison to those services. If you need bottled or jugged drinking water, you should contact retail or workplace water suppliers. Bulk distribution is for large-volume applications requiring truckload volumes.
              </p>
            </div>
          </section>

          {/* Use Cases */}
          <section id="use-cases" className="mb-10">
            <h2 className="font-montserrat text-3xl font-bold text-[#333333] mb-6">Use Cases We Serve</h2>

            <div className="space-y-8">
              <div>
                <h3 className="font-montserrat text-xl font-bold text-[#333333] mb-3">Construction and Civil (Dust Suppression, Compaction, Concrete)</h3>
                <p className="text-gray-700 leading-relaxed">
                  Construction sites are one of the main demand areas for bulk water. Local air quality requirements typically call for dust management. You need to keep spraying water during the active phase of the job. And the moisture content has to be just right. For roadways, building pads, utility ditches, etc., compaction often means several deliveries of water at just the right time.
                </p>
                <p className="text-gray-700 leading-relaxed mt-3">
                  The water should be devoid of oils, excessive salts and alkalis which might affect curing or structural integrity for concrete and masonry work. Many transporters have on-site spray bars, water cannons and dust-control equipment for efficient distribution. Multi-load scheduling is also used for large paving and grading projects to avoid delays and maintain continuous operations.
                </p>
              </div>

              <div>
                <h3 className="font-montserrat text-xl font-bold text-[#333333] mb-3">Residential & Recreation (Pool Filling, Cisterns, Ponds)</h3>
                <p className="text-gray-700 leading-relaxed">
                  Residential pool filling is a typical seasonal service, especially in places where city fill rates are slow or where water conservation rules prevent the use of city water to fill pools. A normal 20,000-gallon pool needs 3 to 4 truckloads and may be filled in one day.
                </p>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Professional transporters have pool volume estimate tools, and they calculate hose routing logistics to safeguard driveways, lawns and landscaping. Many providers include a primer on water chemistry post-fill, including first chlorination, pH balancing and alkalinity modification.
                </p>
              </div>

              <div>
                <h3 className="font-montserrat text-xl font-bold text-[#333333] mb-3">Emergency & Contingency Potable Water</h3>
                <p className="text-gray-700 leading-relaxed">
                  When infrastructure fails, delivering emergency drinking water is an essential service for hospitals, schools, data centers, food manufacturing facilities and municipalities. Established haulers have SLAs (service level agreements) for priority customers and 24/7 emergency dispatch lines.
                </p>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Emergency services sometimes include temporary storage options including portable tanks, bladder systems, and IBC (intermediate bulk container) totes. In the event of a crisis, haulers work with emergency management, generator vendors and Incident Command Systems.
                </p>
              </div>

              <div>
                <h3 className="font-montserrat text-xl font-bold text-[#333333] mb-3">Events, Agriculture, Film/TV, Drilling/Mining</h3>
                <p className="text-gray-700 leading-relaxed">
                  This includes temporary events like festivals, concerts, and outdoor gatherings, which often require potable water for hand-washing stations, food vendors and temporary amenities. Bulk water is needed in remote film and television production sites for cast and crew facilities, dust control and special effects.
                </p>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Bulk water is used by agricultural businesses to prime irrigation systems, to water livestock during drought, and for crop establishment. Water is used in drilling and mining activities to mix drilling mud, control dust and wash equipment.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="mb-10">
            <h2 className="font-montserrat text-3xl font-bold text-[#333333] mb-6">Pricing: How Bulk Water Delivery Is Quoted</h2>
            
            <h3 className="font-montserrat text-xl font-bold text-[#333333] mb-4">The 6 Primary Price Factors</h3>
            <p className="text-gray-700 mb-4">
              The pricing for bulk water supply is a function of several variables that take into account the complexity, urgency, and resources required for each task. Knowing these parameters, clients may estimate expenses and set budgets accurately.
            </p>

            <ul className="space-y-4 mb-6">
              <li>
                <strong>Gallons and loads:</strong> The total volume determines the number of truckloads. A 2,500-gallon truck making four trips costs more in labor and time than one delivery by a 10,000-gallon tanker truck.
              </li>
              <li>
                <strong>Potable vs non-potable certification:</strong> Tanks must be certified for potable water. Sanitized tanks, dedicated hoses, and required paperwork add 20-40% to the underlying cost of delivery.
              </li>
              <li>
                <strong>Travel distance and zones:</strong> Haulers charge depending on zones that factor in fuel expenses, drive duration, and distance from water sources. Deliveries outside normal service areas are subject to extra mileage costs.
              </li>
              <li>
                <strong>Site access and standby time:</strong> Long hose runs, challenging terrain or limited access on complex projects demand more manpower and equipment. The truck gets charged hourly for the time it is waiting during discharge.
              </li>
              <li>
                <strong>Emergency response and dispatch times:</strong> Night, weekend, holiday and emergency response requests are charged at premium rates, often 1.5x-2x the standard fee.
              </li>
              <li>
                <strong>Volume discounts:</strong> Volume discounts of 10–25% are common for frequent deliveries, concentrated job sites, and large-volume contracts.
              </li>
            </ul>

            <h3 className="font-montserrat text-xl font-bold text-[#333333] mb-4">Example Cost Scenarios</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h4 className="font-montserrat font-bold text-[#333333] mb-2">Residential Pool Fill (20,000 gallons)</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Suburban location, 15 miles from water source, typical business hours, nice driveway access.
                </p>
                <p className="font-semibold text-[#005A9C]">Estimate: $400–$700</p>
                <p className="text-xs text-gray-600 mt-2">Rural area with 45 miles delivery adds $200–$300</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h4 className="font-montserrat font-bold text-[#333333] mb-2">Construction Dust Control (8 hours)</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Non-potable, 4,000 gallon truck with on-site standby for continuous spray operations.
                </p>
                <p className="font-semibold text-[#005A9C]">Estimate: $800–$1,200</p>
                <p className="text-xs text-gray-600 mt-2">Night paving adds $1,200–$1,800</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h4 className="font-montserrat font-bold text-[#333333] mb-2">Emergency Potable Delivery</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Saturday evening restaurant water main break, 3,000 gallons potable in 4 hours.
                </p>
                <p className="font-semibold text-[#005A9C]">Estimate: $900–$1,400</p>
                <p className="text-xs text-gray-600 mt-2">Includes emergency dispatch, potable certification, and after-hours fee</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h4 className="font-montserrat font-bold text-[#333333] mb-2">Note on Regional Pricing</h4>
                <p className="text-sm text-gray-700">
                  Regional pricing varies based on local water source costs, fuel prices, and competitive market conditions. These estimates reflect typical ranges across mid-sized US markets.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-[#005A9C] p-5 rounded">
              <h4 className="font-montserrat font-bold text-[#333333] mb-2">Interactive Estimator</h4>
              <p className="text-gray-700">
                Many water hauling firms, including HaulAgua, have interactive estimation features that give you fast ballpark quotes. Most calculators ask for delivery location (zip code), total gallons needed, water type (potable vs non-potable), delivery timing, and site access details. These tools provide line-item breakdowns including haul charges, water costs, and any after-hours surcharges.
              </p>
            </div>
          </section>

          {/* Booking Section */}
          <section id="booking" className="mb-10">
            <h2 className="font-montserrat text-3xl font-bold text-[#333333] mb-6">How Booking Works (Step-by-Step)</h2>
            
            <p className="text-gray-700 mb-6">
              The bulk water delivery booking process is designed for simplicity and clarity, whether you're ordering online, by phone, or through a hauler directory platform.
            </p>

            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="font-montserrat font-bold text-[#005A9C] min-w-fit">Step 1:</span>
                <div>
                  <strong className="text-[#333333]">Share details</strong>
                  <p className="text-gray-700 mt-1">Provide delivery address, total gallons needed, potable or non-potable requirement, preferred delivery date and time window, and site access information (gate codes, hose run length, discharge point location).</p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="font-montserrat font-bold text-[#005A9C] min-w-fit">Step 2:</span>
                <div>
                  <strong className="text-[#333333]">Receive quote</strong>
                  <p className="text-gray-700 mt-1">Most haulers provide quotes within 1–2 hours during business hours, or immediately via online estimators. The quote includes load count, water type, travel zone, and any access or timing premiums.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="font-montserrat font-bold text-[#005A9C] min-w-fit">Step 3:</span>
                <div>
                  <strong className="text-[#333333]">Confirm and schedule</strong>
                  <p className="text-gray-700 mt-1">Accept the quote and confirm the delivery window. For emergency or same-day service, dispatch typically occurs within 2–4 hours. Scheduled deliveries receive confirmation 24 hours in advance.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="font-montserrat font-bold text-[#005A9C] min-w-fit">Step 4:</span>
                <div>
                  <strong className="text-[#333333]">Site preparation</strong>
                  <p className="text-gray-700 mt-1">Ensure clear access for the truck (minimum 12-foot width, stable surface), identify the discharge point, and have any required hoses or adapters ready. For potable deliveries, confirm that storage tanks or systems are clean and accessible.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="font-montserrat font-bold text-[#005A9C] min-w-fit">Step 5:</span>
                <div>
                  <strong className="text-[#333333]">Delivery and discharge</strong>
                  <p className="text-gray-700 mt-1">The driver arrives within the scheduled window, confirms the discharge point, and begins filling. Standard discharge takes 20–45 minutes per load depending on volume and hose diameter.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="font-montserrat font-bold text-[#005A9C] min-w-fit">Step 6:</span>
                <div>
                  <strong className="text-[#333333]">Documentation and payment</strong>
                  <p className="text-gray-700 mt-1">For potable deliveries, the driver provides water quality certificates and chain-of-custody documentation. Payment is typically due on delivery via check, credit card, or invoiced account for commercial customers.</p>
                </div>
              </li>
            </ol>
          </section>

          {/* Conclusion */}
          <section className="mb-10 border-t-2 border-gray-200 pt-8">
            <h2 className="font-montserrat text-3xl font-bold text-[#333333] mb-4">Conclusion</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              Bulk water delivery services are a key component for construction projects, household demands, agricultural activities, and emergency circumstances when fast access to huge amounts of water is necessary. Knowing the difference between potable and non-potable water, understanding the important pricing variables, and how to prepare your site can ensure smooth, cost-effective delivery.
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              Working with professional, qualified carriers ensures compliance, safety and reliability whether you're filling a swimming pool, controlling dust on a building site or responding to an emergency water supply outage. With transparent pricing, timely delivery and adjustable capacity options, bulk water supply is a viable solution for various uses in residential, commercial and industrial areas.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Use online estimate tools, know your specific water quality demands, and plan for site access and timeliness to streamline your procurement process and ensure your project or site gets the water supply it needs, when it needs it.
            </p>
          </section>
        </div>

        {/* CTA Section */}
        <section className="mt-12 bg-gradient-to-r from-[#005A9C] to-[#003d6b] rounded-lg p-8 text-white">
          <h2 className="font-montserrat text-2xl font-bold mb-3">Ready to Get a Quote?</h2>
          <p className="font-lato mb-6">
            Find qualified bulk water haulers in your area and get instant pricing quotes.
          </p>
          <Link 
            href="/get-quote"
            className="inline-block bg-[#F2A900] text-[#333333] px-6 py-3 rounded-lg font-montserrat font-semibold hover:bg-[#e0990a] transition-colors"
          >
            Get a Free Quote
          </Link>
        </section>
      </div>

      {/* Related Articles Footer */}
      <section className="bg-white border-t border-gray-200 mt-16">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="font-montserrat text-2xl font-bold text-[#333333] mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Pool Filling Services Guide',
                slug: 'pool-filling',
              },
              {
                title: 'Construction Site Water Management',
                slug: 'construction-water',
              },
              {
                title: 'Emergency Water Delivery: What to Know',
                slug: 'emergency-water-delivery',
              },
            ].map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-[#005A9C] transition-all"
              >
                <h3 className="font-montserrat font-semibold text-[#333333] group-hover:text-[#005A9C] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2">Read more →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
};

export default BlogPostPage;
