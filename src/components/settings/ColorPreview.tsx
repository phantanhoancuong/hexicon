import { Icon } from "@/components/ui";
import { crown } from "@/icons";
import { CAPTURABLE_CLASS, STATUS_CLASS } from "@/lib/tileStyles";

const HEX_CLIP =
  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

const HEX_WIDTH = 3;
const HEX_HEIGHT = HEX_WIDTH * (Math.sqrt(3) / 2);

type Sample = {
  colorClass: string;
  content: "crown" | string;
};

const GROUPS: { label: string; tiles: [Sample, Sample] }[] = [
  {
    label: "PLAYER 1",
    tiles: [
      { colorClass: STATUS_CLASS[1], content: "crown" },
      { colorClass: CAPTURABLE_CLASS[1], content: "A" },
    ],
  },
  {
    label: "PLAYER 2",
    tiles: [
      { colorClass: STATUS_CLASS[2], content: "crown" },
      { colorClass: CAPTURABLE_CLASS[2], content: "B" },
    ],
  },
];

export default function ColorPreview() {
  return (
    <ul className="flex justify-around" aria-label="Color preview">
      {GROUPS.map(({ label, tiles }) => (
        <li key={label} className="flex flex-col items-center gap-2">
          <div
            aria-hidden="true"
            className="relative"
            style={{
              width: `${HEX_WIDTH * 1.75}rem`,
              height: `${HEX_HEIGHT * 1.5}rem`,
            }}
          >
            {tiles.map(({ colorClass, content }, index) => (
              <span
                key={index}
                className={`${colorClass} absolute flex items-center justify-center text-lg`}
                style={{
                  width: `${HEX_WIDTH}rem`,
                  height: `${HEX_HEIGHT}rem`,
                  left: index === 0 ? 0 : `${HEX_WIDTH * 0.75}rem`,
                  top: index === 0 ? `${HEX_HEIGHT / 2}rem` : 0,
                  clipPath: HEX_CLIP,
                }}
              >
                {content === "crown" ? (
                  <Icon src={crown} className="size-5" alt="" />
                ) : (
                  content
                )}
              </span>
            ))}
          </div>
          <span className="text-[10px] tracking-wide text-muted-foreground">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
