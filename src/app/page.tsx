import { MenuPanel } from "@/components/menu";

/** Home page, with the game menu. */
export default function Home() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center pb-12">
      <nav className="w-full max-w-sm">
        <MenuPanel />
      </nav>
    </div>
  );
}
