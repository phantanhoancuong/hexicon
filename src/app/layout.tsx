import "@/app/globals.css";

import type { Metadata } from "next";

import { Inter, JetBrains_Mono } from "next/font/google";

import {
  AutoFlipButton,
  BackLink,
  ColorPalette,
  DictionaryPreload,
  HomeTitle,
  SettingsButton,
} from "@/components/layout";

import { ThemeProvider } from "next-themes";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hexicon",
  description: "A hex word game based on capturing tiles by forming words.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col select-none">
        <ThemeProvider storageKey="hexicon:theme">
          <script
            dangerouslySetInnerHTML={{
              __html: `try{if(localStorage.getItem("hexicon:colorBlind")==="true")document.documentElement.dataset.palette="color-blind"}catch(e){}`,
            }}
          />
          <ColorPalette />
          <DictionaryPreload />
          <div className="flex h-dvh flex-col overflow-hidden bg-background font-mono text-foreground">
            <header className="mx-auto flex h-24 w-full max-w-384 shrink-0 items-center px-5 sm:h-26 sm:px-8 lg:h-28 lg:px-16">
              <BackLink />
              <HomeTitle />
              <div className="ml-auto flex items-center gap-2">
                <AutoFlipButton />
                <SettingsButton />
              </div>
            </header>

            <main className="mx-auto flex min-h-0 w-full max-w-384 flex-1 justify-center px-5 pb-2 sm:px-8 sm:pb-4 lg:px-16">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
