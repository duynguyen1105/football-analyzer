import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy — MatchDay Analyst",
  description:
    "Privacy policy for MatchDay Analyst. Learn how we handle data, cookies, and third-party services.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-text-muted text-xs mb-10">
          Last updated: March 2026
        </p>

        {/* Introduction */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Introduction</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            MatchDay Analyst (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
            is a pre-match football analysis website. We are committed to
            protecting your privacy. This policy explains what information we
            collect, how we use it, and your rights regarding that information.
          </p>
        </section>

        {/* What we collect */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">
            Information We Collect
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            MatchDay Analyst does not require user accounts, logins, or
            registration. We do not collect, store, or process personal data
            such as names, email addresses, or payment information.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            The only data we may collect is anonymous usage data through cookies
            and analytics services, as described below.
          </p>
        </section>

        {/* Cookies */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Cookies</h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            Cookies are small text files stored on your device by your browser.
            We may use cookies for the following purposes:
          </p>
          <ul className="space-y-2 text-text-secondary text-sm leading-relaxed list-disc list-inside">
            <li>
              <strong className="text-text-primary">
                Essential cookies
              </strong>{" "}
              — To remember your language preference (English or Vietnamese) and
              ensure the site functions correctly.
            </li>
            <li>
              <strong className="text-text-primary">
                Analytics cookies
              </strong>{" "}
              — To understand how visitors use the site (pages visited, time on
              site, general location). These help us improve the experience.
            </li>
            <li>
              <strong className="text-text-primary">
                Advertising cookies
              </strong>{" "}
              — If ads are displayed, third-party advertising services may set
              cookies to serve relevant ads.
            </li>
          </ul>
          <p className="text-text-secondary text-sm leading-relaxed mt-3">
            You can control or delete cookies through your browser settings. Be
            aware that disabling cookies may affect the functionality of certain
            features.
          </p>
        </section>

        {/* Third-party services */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Third-Party Services</h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            We may use the following third-party services:
          </p>

          <div className="space-y-4">
            <div className="border-l-2 border-accent pl-4">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                Google Analytics
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                We may use Google Analytics to collect anonymous information
                about site usage, such as page views, visit duration, and
                referral sources. Google Analytics uses cookies and processes
                data in accordance with{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
                >
                  Google&apos;s Privacy Policy
                </a>
                .
              </p>
            </div>

            <div className="border-l-2 border-accent pl-4">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                Google AdSense
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                We may display advertisements through Google AdSense. Google
                AdSense may use cookies to serve ads based on your prior visits
                to this site or other websites. You can opt out of personalized
                advertising by visiting{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
                >
                  Google Ads Settings
                </a>
                .
              </p>
            </div>

            <div className="border-l-2 border-accent-2 pl-4">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                API-Football
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Match data, statistics, and results displayed on this site are
                sourced from{" "}
                <a
                  href="https://www.football-data.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
                >
                  API-Football
                </a>{" "}
                under their free tier terms. No user data is shared with
                API-Football.
              </p>
            </div>
          </div>
        </section>

        {/* AI-generated content */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">
            AI-Generated Content Disclaimer
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            Parts of the analysis on this site are generated by artificial
            intelligence (Claude by Anthropic). AI-generated content is provided
            for informational and entertainment purposes only. While we strive
            for accuracy, AI analysis may contain errors, inaccuracies, or
            outdated information.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            AI-generated sections are clearly labelled on the site. We recommend
            using them as a supplement to your own judgement, not as a sole
            source of information.
          </p>
        </section>

        {/* Children */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">
            Children&apos;s Privacy
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            This site is not directed at children under 13. We do not knowingly
            collect personal information from children. If you believe a child
            has provided us with personal data, please contact us so we can
            remove it.
          </p>
        </section>

        {/* Changes */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">
            Changes to This Policy
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            We may update this privacy policy from time to time. Any changes
            will be posted on this page with an updated &quot;Last
            updated&quot; date. We encourage you to review this page
            periodically.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-3">Contact Us</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            If you have any questions about this privacy policy, please contact
            us at{" "}
            <a
              href="mailto:contact@matchdayanalyst.com"
              className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
            >
              contact@matchdayanalyst.com
            </a>
            .
          </p>
        </section>

        {/* Footer nav */}
        <div className="mt-10 flex items-center justify-center gap-6 text-sm text-text-muted">
          <Link
            href="/"
            className="hover:text-text-primary transition-colors"
          >
            Home
          </Link>
          <span className="text-border">|</span>
          <Link
            href="/about"
            className="hover:text-text-primary transition-colors"
          >
            About
          </Link>
        </div>
      </main>
    </>
  );
}
