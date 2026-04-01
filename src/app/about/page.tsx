import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "About — MatchDay Analyst",
  description:
    "Learn about MatchDay Analyst, a pre-match football analysis site powered by data from API-Football and AI insights from Claude.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">About MatchDay Analyst</h1>
        <p className="text-text-secondary text-sm mb-10">
          Pre-match analysis for football fans who want to be informed, not
          influenced.
        </p>

        {/* What we do */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-accent">&#9917;</span> What We Do
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            MatchDay Analyst provides in-depth pre-match analysis for top
            European football leagues. Before every match, we break down team
            form, head-to-head records, key stats, and tactical insights so you
            can walk into kickoff fully informed. Whether you follow the Premier
            League, La Liga, Serie A, Bundesliga, or Ligue 1, our goal is to
            give you a clear, data-driven picture of what to expect.
          </p>
        </section>

        {/* How it works */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-accent-2">&#128202;</span> How It Works
          </h2>
          <ul className="space-y-3 text-text-secondary text-sm leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-accent font-bold">1.</span>
              <span>
                <strong className="text-text-primary">Data collection</strong>{" "}
                — We pull match schedules, results, standings, and statistics
                from{" "}
                <a
                  href="https://www.football-data.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
                >
                  API-Football
                </a>
                , a trusted open data provider for football.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-accent font-bold">2.</span>
              <span>
                <strong className="text-text-primary">AI analysis</strong> — The
                raw data is fed into{" "}
                <a
                  href="https://www.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
                >
                  Claude
                </a>{" "}
                by Anthropic, which generates readable pre-match previews,
                identifies trends, and highlights key factors for each fixture.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-accent font-bold">3.</span>
              <span>
                <strong className="text-text-primary">Presented to you</strong>{" "}
                — The analysis is published on this site before kickoff, giving
                you a concise briefing you can read in minutes.
              </span>
            </li>
          </ul>
        </section>

        {/* Who it's for */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-accent-yellow">&#127775;</span> Who It&apos;s
            For
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            MatchDay Analyst is built for football fans who want to understand
            the story behind every match. Whether you are catching up on your
            favourite team or watching a neutral fixture, having context — form,
            stats, tactical notes — makes the experience richer. We serve
            content in both English and Vietnamese, with a focus on the
            Vietnamese football community.
          </p>
        </section>

        {/* Data attribution */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-accent-2">&#128279;</span> Data Attribution
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            Football data is provided by{" "}
            <a
              href="https://www.football-data.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
            >
              API-Football
            </a>
            . We use their API under the free tier and are grateful for the
            service they provide to the developer community. All match data,
            results, and statistics originate from their platform.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            AI-generated analysis is produced by{" "}
            <a
              href="https://www.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
            >
              Claude (Anthropic)
            </a>
            . AI insights are supplementary and should not be taken as factual
            reporting. They are clearly labelled on the site.
          </p>
        </section>

        {/* Independence disclaimer */}
        <section className="bg-bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>&#9878;&#65039;</span> Independence
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            MatchDay Analyst is an independent project. We are not affiliated
            with, endorsed by, or connected to any football club, league,
            federation, or governing body. All team names, logos, and
            competition names are used for informational purposes only and
            belong to their respective owners.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-accent">&#9993;&#65039;</span> Contact
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Have questions or feedback? Reach out at{" "}
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
            href="/privacy"
            className="hover:text-text-primary transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </main>
    </>
  );
}
