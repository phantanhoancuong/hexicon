"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Icon from "@/components/Icon";

import { chevronLeft } from "@/icons";

export default function BackLink() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <Link
      href="/"
      className="-ml-1 inline-flex h-8 items-center gap-1 rounded-md pr-2 pl-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <Icon src={chevronLeft} className="size-5" />
      Menu
    </Link>
  );
}
