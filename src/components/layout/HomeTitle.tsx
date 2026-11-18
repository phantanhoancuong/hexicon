"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoBlack, logoWhite } from "@/icons";

export default function HomeTitle() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <h1>
      <Link
        href="/"
        aria-label="hexicon, go to the menu"
        aria-current="page"
        className="-ml-1 flex cursor-pointer items-center rounded-md px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Image
          src={logoBlack}
          alt=""
          className="h-6 w-auto in-data-[theme=dark]:hidden sm:h-8 lg:h-9"
        />
        <Image
          src={logoWhite}
          alt=""
          className="hidden h-6 w-auto in-data-[theme=dark]:block sm:h-8 lg:h-9"
        />
      </Link>
    </h1>
  );
}
