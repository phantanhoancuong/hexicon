import type { Preview } from "@/components/tutorial/previews";

import { TURN_SECONDS } from "@/game/constants";

export type Rule = {
  title: string;
  text: string;
  preview?: Preview;
};

export const RULES: Rule[] = [
  {
    title: "Goal",
    text: "Capture all of your opponent's land. The game ends when only one player has any land left.",
  },
  {
    title: "Your turn",
    text: "Spell words using neutral tiles. The tiles do not have to touch each other, and words need to be at least 2 letter-long.",
    preview: {
      columns: ["1 1 1", "L R D E", "H A S", "N T O U", "I B E"],
      taps: ["3.1", "2.1", "1.1"],
    },
  },
  {
    title: "Capturing",
    text: "Tiles in your word that touch your land are CAPTURED. Tiles that don't touch your land but can link to other tiles that do also get CAPTURED.",
    preview: {
      columns: ["1 1 1", "S O T R", "H A E", "I O U N", "L D S"],
      taps: ["1.2", "2.2", "3.3"],
    },
  },
  {
    title: "Not captured",
    text: "Tiles in your word that are not linked to your land are not captured. They stay neutral and change to a new letter.",
    preview: {
      columns: ["1 1 1", "L S O R", "H E A", "I N T U", "B E D"],
      taps: ["1.1", "2.1", "3.1", "4.2"],
    },
  },
  {
    title: "Taking land",
    text: "Enemy tiles and empty tiles next to a captured tile turn neutral.",
    preview: {
      columns: ["1 1 1", "L O A R", "H N S", "2 2 2 2", "2 2 2"],
      taps: ["1.1", "2.1"],
    },
  },
  {
    title: "Capitals",
    text: "Capturing a tile next to an enemy capital destroys the capital, doing so also give you another turn.",
    preview: {
      columns: ["1 1 1", "L R T E", "H A O", "2 2 C2 2", "2 2 2"],
      taps: ["1.2", "2.2"],
    },
  },
  {
    title: "Time",
    text: `You have ${TURN_SECONDS} seconds per turn. If time runs out, your turn is skipped. If both players are skipped in a row, or no word can be made from the letters on the grid, the letters are re-dealt again.`,
  },
];
