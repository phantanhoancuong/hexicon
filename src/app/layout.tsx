import "@/app/globals.css";

import type { Metadata } from "next";

import { Inter, JetBrains_Mono } from "next/font/google";

import {
  AutoFlipButton,
  BackLink,
  ColorPalette,
  DictionaryPreload,
  SettingsButton,
  ThemeButton,
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
      <body className="flex min-h-full flex-col">
        <ThemeProvider storageKey="hexicon:theme">
          <script
            dangerouslySetInnerHTML={{
              __html: `try{if(localStorage.getItem("hexicon:colorBlind")==="true")document.documentElement.dataset.palette="color-blind"}catch(e){}`,
            }}
          />
          <ColorPalette />
          <DictionaryPreload />
          <div className="flex h-dvh flex-col overflow-hidden bg-background font-mono text-foreground">
            <header className="flex h-12 w-full shrink-0 items-center px-4 sm:px-8">
              <BackLink />
              <div className="ml-auto flex items-center gap-2">
                <AutoFlipButton />
                <SettingsButton />
                <ThemeButton />
              </div>
            </header>

            <main className="flex min-h-0 flex-1 justify-center px-2 pb-2 sm:px-8 sm:pb-4">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
