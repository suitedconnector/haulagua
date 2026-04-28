import type { Metadata } from "next"
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy | HaulAgua",
  description:
    "Learn how HaulAgua collects, uses, and protects your information when you use our bulk water hauling directory.",
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8F9FA] min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mb-10">
            Effective Date: April 25, 2026
          </p>

          <div
            className="space-y-10 text-base leading-relaxed"
            style={{ color: "#333333", fontFamily: "Lato, sans-serif" }}
          >
            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                1. Information We Collect
              </h2>
              <p>
                When you use HaulAgua (haulagua.com), we may collect the
                following types of information:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Usage data</strong> — pages visited, search queries
                  entered, links clicked, time spent on pages, and referring
                  URLs. This is collected automatically via Google Analytics and
                  Vercel Analytics.
                </li>
                <li>
                  <strong>Device and browser information</strong> — IP address,
                  browser type and version, operating system, and screen
                  resolution, collected by Google Analytics.
                </li>
                <li>
                  <strong>Contact form submissions</strong> — if you submit an
                  inquiry through our contact form, we collect your name, email
                  address, and message content.
                </li>
                <li>
                  <strong>Cookies</strong> — small text files stored on your
                  device by your browser. We use cookies for analytics purposes
                  only (see Section 3).
                </li>
              </ul>
              <p className="mt-3">
                We do not collect payment information, social security numbers,
                or other sensitive personal data.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To operate and improve the HaulAgua directory</li>
                <li>
                  To understand how visitors find and use the site so we can
                  improve search results and page content
                </li>
                <li>
                  To respond to inquiries submitted through our contact form
                </li>
                <li>
                  To monitor site performance and diagnose technical issues
                </li>
              </ul>
              <p className="mt-3">
                We do not sell your personal information to third parties. We do
                not use your data for targeted advertising.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                3. Cookies and Tracking
              </h2>
              <p>HaulAgua uses the following tracking tools:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Google Analytics 4</strong> (tag ID: G-8W9S9729JY) —
                  collects anonymized usage data including pages viewed, session
                  duration, and approximate geographic location based on IP
                  address. Google may transfer this data to servers in the
                  United States or other countries. You can opt out by installing
                  the{" "}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: "#005A9C" }}
                  >
                    Google Analytics Opt-out Browser Add-on
                  </a>
                  .
                </li>
                <li>
                  <strong>Vercel Analytics</strong> — privacy-friendly,
                  cookieless analytics provided by our hosting platform, Vercel.
                  No personally identifiable information is collected.
                </li>
              </ul>
              <p className="mt-3">
                You can disable cookies in your browser settings at any time.
                Doing so may affect some site functionality.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                4. Third-Party Services
              </h2>
              <p>
                HaulAgua uses the following third-party services to operate the
                site:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Google Analytics</strong> — web analytics (see Section
                  3)
                </li>
                <li>
                  <strong>Vercel</strong> — website hosting and deployment
                </li>
                <li>
                  <strong>Cloudinary</strong> — image storage and delivery for
                  hauler photos
                </li>
                <li>
                  <strong>Cloudflare</strong> — DNS and security
                </li>
              </ul>
              <p className="mt-3">
                HaulAgua links to individual hauler websites. We are not
                responsible for the privacy practices of those websites. We
                encourage you to review their privacy policies before sharing
                any personal information with them.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                5. Data Retention
              </h2>
              <p>
                Analytics data collected by Google Analytics is retained for 26
                months by default, in accordance with Google&apos;s standard
                retention settings. Contact form submissions are retained for as
                long as necessary to respond to your inquiry. You may request
                deletion of your data at any time by contacting us (see Section
                9).
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                6. Your Rights (California Residents — CCPA)
              </h2>
              <p>
                If you are a California resident, you have the following rights
                under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  The right to know what personal information we collect and how
                  it is used
                </li>
                <li>
                  The right to request deletion of your personal information
                </li>
                <li>
                  The right to opt out of the sale of your personal information
                  (note: HaulAgua does not sell personal information)
                </li>
                <li>The right to non-discrimination for exercising your rights</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:privacy@haulagua.com"
                  className="underline"
                  style={{ color: "#005A9C" }}
                >
                  privacy@haulagua.com
                </a>
                . We will respond within 45 days.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                7. Children&apos;s Privacy
              </h2>
              <p>
                HaulAgua is not directed at children under the age of 13. We do
                not knowingly collect personal information from children. If you
                believe a child has provided us with personal information, please
                contact us and we will delete it promptly.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                8. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. When we do,
                we will update the effective date at the top of this page. We
                encourage you to review this policy periodically. Continued use
                of HaulAgua after changes are posted constitutes your acceptance
                of the updated policy.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                9. Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy or wish to
                exercise your privacy rights, please contact us at:
              </p>
              <div className="mt-3">
                <p>
                  <strong>HaulAgua</strong>
                </p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:privacy@haulagua.com"
                    className="underline"
                    style={{ color: "#005A9C" }}
                  >
                    privacy@haulagua.com
                  </a>
                </p>
                <p>Website: haulagua.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}