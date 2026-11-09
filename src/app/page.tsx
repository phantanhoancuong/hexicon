import { MenuPanel } from "@/components/menu";

/** Home page, with the game menu. */
export default function Home() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 pb-12">
      <h1 className="font-mono text-4xl font-semibold tracking-widest">
        HEXICON
      </h1>

      <nav className="w-full max-w-xs">
        <MenuPanel />
      </nav>
    </div>
  );
}
