import Link from "next/link";

import { Icon } from "@/components/ui";
import { help } from "@/icons";

export default function HelpLink() {
  return (
    <Link
      href="/how-to-play"
      aria-label="How to play"
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground sm:size-8 lg:size-9"
    >
      <Icon src={help} className="size-7 sm:size-8 lg:size-9" />
    </Link>
  );
}
