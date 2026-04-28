import type { Metadata } from "next"
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms of Service | HaulAgua",
  description:
    "Read the terms and conditions for using the HaulAgua bulk water hauling directory.",
}

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F8F9FA] min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
          >
            Terms of Service
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
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using HaulAgua (haulagua.com), you agree to be
                bound by these Terms of Service. If you do not agree to these
                terms, please do not use the site. We reserve the right to
                update these terms at any time — continued use of the site
                after changes are posted constitutes acceptance.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                2. Directory Use — Informational Only
              </h2>
              <p>
                HaulAgua is a directory of bulk water hauling businesses.
                The information provided on this site — including hauler names,
                phone numbers, addresses, service descriptions, hours, and
                certifications — is intended for informational purposes only.
              </p>
              <p className="mt-3">
                HaulAgua does not provide water hauling services directly. We
                are not a party to any agreement between you and any hauler
                listed on this site. Any service you arrange with a hauler is
                solely between you and that hauler.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                3. Listing Accuracy
              </h2>
              <p>
                We strive to keep listing information current and accurate, but
                we do not independently verify all information provided by or
                about haulers listed on this site. HaulAgua makes no
                representations or warranties — express or implied — regarding
                the accuracy, completeness, reliability, or timeliness of any
                listing.
              </p>
              <p className="mt-3">
                Hauler licenses, certifications, insurance status, pricing, and
                availability may change at any time. Always verify this
                information directly with the hauler before engaging their
                services.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                4. No Endorsement
              </h2>
              <p>
                A listing on HaulAgua does not constitute an endorsement,
                recommendation, or guarantee of any hauler&apos;s services,
                quality, or fitness for any particular purpose. The presence of
                a &quot;Verified Pro&quot; badge indicates only that the hauler
                has completed our verification process at the time of
                verification — it is not a guarantee of ongoing compliance or
                service quality.
              </p>
              <p className="mt-3">
                Links to hauler websites are provided for convenience. HaulAgua
                is not responsible for the content, accuracy, or privacy
                practices of any third-party website.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                5. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by law, HaulAgua and its
                owners, employees, and agents shall not be liable for any
                direct, indirect, incidental, special, or consequential damages
                arising from:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Your use of or inability to use this site</li>
                <li>
                  Any inaccuracy or omission in hauler listing information
                </li>
                <li>
                  Any service, dispute, or transaction between you and a listed
                  hauler
                </li>
                <li>
                  Any unauthorized access to or alteration of your data
                </li>
              </ul>
              <p className="mt-3">
                Your use of this site and any hauler services arranged through
                it is entirely at your own risk.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                6. Prohibited Uses
              </h2>
              <p>You agree not to use HaulAgua to:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  Scrape, copy, or harvest listing data for commercial use
                  without our written permission
                </li>
                <li>
                  Submit false, misleading, or fraudulent information through
                  any form or listing request
                </li>
                <li>
                  Interfere with or disrupt the site&apos;s operation or
                  servers
                </li>
                <li>
                  Use the site for any unlawful purpose or in violation of any
                  applicable regulations
                </li>
                <li>
                  Impersonate any hauler, business, or individual listed on the
                  site
                </li>
              </ul>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                7. Intellectual Property
              </h2>
              <p>
                All content on HaulAgua — including text, design, graphics,
                logos, and code — is the property of HaulAgua or its content
                suppliers and is protected by applicable copyright and trademark
                laws. You may not reproduce, distribute, or create derivative
                works from any site content without our express written
                permission.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#005A9C", fontFamily: "Montserrat, sans-serif" }}
              >
                8. Governing Law
              </h2>
              <p>
                These Terms of Service shall be governed by and construed in
                accordance with the laws of the State of California, without
                regard to its conflict of law provisions. Any disputes arising
                under these terms shall be subject to the exclusive jurisdiction
                of the courts located in Los Angeles County, California.
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
                Questions about these Terms of Service? Contact us at:
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