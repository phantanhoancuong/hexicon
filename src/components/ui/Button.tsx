import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

type Size = "md" | "lg";

type ButtonStyle = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

const BASE_CLASS =
  "flex cursor-pointer items-center justify-center rounded-md px-4 font-semibold tracking-wide disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground",
  secondary: "border-2 border-border",
};

const SIZE_CLASS: Record<Size, string> = {
  md: "h-10",
  lg: "h-12",
};

export const buttonClass = ({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyle = {}): string =>
  [BASE_CLASS, VARIANT_CLASS[variant], SIZE_CLASS[size], className]
    .filter(Boolean)
    .join(" ");

export default function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonStyle) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, className })}
      {...props}
    />
  );
}
