import Link from "next/link";

export default function MenuFooter() {
  return (
    <footer className="absolute inset-x-0 bottom-3 flex justify-center gap-4 text-xs text-muted-foreground">
      <Link
        href="/about"
        className="underline underline-offset-2 hover:text-foreground"
      >
        About
      </Link>
    </footer>
  );
}
