import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About - Hexicon",
};

const GITHUB_URL = "https://github.com/phantanhoancuong/hexicon/issues";

const CONTACT_EMAIL = "phantanhoancuong@gmail.com";

const SECTION_CLASS = "flex flex-col gap-4 border-t-2 border-border pt-8";

type Credit = {
  name: string;
  href: string;
  description: string;
};

const CREDITS: Credit[] = [
  {
    name: "Re-Enable",
    href: "https://github.com/jakesmd/re-enable",
    description: "Word list by Jacob Drew. MIT.",
  },
  {
    name: "FrequencyWords",
    href: "https://github.com/hermitdave/FrequencyWords",
    description: "Word frequencies by Hermit Dave. MIT and CC BY-SA 4.0.",
  },
  {
    name: "Material Symbols",
    href: "https://fonts.google.com/icons",
    description: "Icons by Google. Apache 2.0.",
  },
  {
    name: "Inter",
    href: "https://github.com/rsms/inter",
    description: "Font by Rasmus Andersson. OFL 1.1.",
  },
  {
    name: "JetBrains Mono",
    href: "https://github.com/JetBrains/JetBrainsMono",
    description: "Font by JetBrains. OFL 1.1.",
  },
];

const LICENSE_LINKS: { label: string; href: string }[] = [
  {
    label: "Apache 2.0",
    href: "https://www.apache.org/licenses/LICENSE-2.0",
  },
  { label: "SIL OFL 1.1", href: "https://openfontlicense.org" },
  {
    label: "CC BY-SA 4.0",
    href: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
];

const MIT_TEXT = [
  'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:',
  "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.",
  'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
];

function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`underline-offset-2 hover:underline ${className ?? ""}`}
    >
      {children}
    </a>
  );
}

function MitNotice({ name, copyright }: { name: string; copyright: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold text-foreground">{name}</h3>
      <p>MIT License. {copyright}</p>
      {MIT_TEXT.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function Row({ name, children }: { name: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:grid sm:grid-cols-[13rem_1fr] sm:gap-x-8">
      <dt className="font-semibold">{name}</dt>
      <dd className="text-sm leading-6 text-muted-foreground">{children}</dd>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="h-full w-full max-w-3xl [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-col gap-10 px-3 py-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-widest">HEXICON</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Hexicon is a fan-made game inspired by Capitals by NimbleBit. It is
            not affiliated with or endorsed by NimbleBit.
          </p>
        </div>

        <section className={SECTION_CLASS}>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="leading-7">
            If you found a bug, have a question, or a new idea, please tell me
            on{" "}
            <ExternalLink
              href={`${GITHUB_URL}/issues`}
              className="font-semibold text-accent underline"
            >
              GitHub issues
            </ExternalLink>
            , or write to{" "}
            <ExternalLink
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-accent underline"
            >
              {CONTACT_EMAIL}
            </ExternalLink>
            .
          </p>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="text-xl font-semibold">Credits</h2>
          <dl className="flex flex-col gap-5">
            {CREDITS.map(({ name, href, description }) => (
              <Row
                key={name}
                name={<ExternalLink href={href}>{name}</ExternalLink>}
              >
                {description}
              </Row>
            ))}
          </dl>
        </section>

        <section className={SECTION_CLASS}>
          <h2 className="text-xl font-semibold">Licenses</h2>
          <div className="flex max-w-2xl flex-col gap-4 text-xs leading-5 text-muted-foreground">
            <p className="flex flex-wrap gap-x-4">
              {LICENSE_LINKS.map(({ label, href }) => (
                <ExternalLink key={label} href={href} className="underline">
                  {label}
                </ExternalLink>
              ))}
            </p>
            <MitNotice
              name="Re-Enable"
              copyright="Copyright (c) 2025 Jacob Drew."
            />
            <MitNotice
              name="FrequencyWords"
              copyright="Copyright (c) 2016 Hermit Dave."
            />
          </div>
        </section>
      </div>
    </div>
  );
}
