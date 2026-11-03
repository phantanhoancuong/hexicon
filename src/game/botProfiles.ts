import { Difficulty } from "@/game/difficulty";

/** How a bot level plays. Score terms are weighted, then one move is picked by a softmax. */
/**
 * Settings of a bot level.
 *
 * See `"Bot's logical scheme"` at the top of `bot.ts` for the stages the properties belong to.
 */
export type BotProfile = {
  /** NOTICE: The chance of spotting a tile with a bias towards tiles closer to the bot's territory. */
  attention: number;
  /** RECALL: How fast recall drops for less common words. A common word is recalled with a chance of its commonness raised to this power, so higher values forget less common words more often. */
  recallPower: number;
  /** RECALL: The longest uncommon word the bot will try to guess. Guesses start at 2 letters and it is increasingly rare for the bot to guess longer words. */
  maxGuessLength: number;
  /** RECALL: the most recalled words the bot goes on to place. */
  /** RECALL: The most recalled words the bot goes on to place. */
  candidateWords: number;
  /** PLACE: How many placements the bot tries for each word. */
  placements: number;
  /** PLACE: How strongly the enemy capital draws the tiles the bot places. */
  goalPull: number;
  /** SCORE: The weight of the damage a move does to the enemy. */
  damage: number;
  /** SCORE: The weight of how common a word is. */
  familiarity: number;
  /** SCORE: The weight of getting closer to the enemy capital. */
  approach: number;
  /** SCORE: The penalty for making the border longer. */
  perimeter: number;
  /** SCORE: The penalty for open tiles around the bot's capital. */
  holes: number;
  /** SCORE: How many rings of tiles around the bot's capital the bot tries to keep filled. */
  baseLayers: number;
  /** SCORE: How near an enemy tile must be for an open tile to count as a threat. */
  threatReach: number;
  /** CHOOSE: How randomly the bot picks words. Lower values makes the bot more careful and more likely to pick better words. */
  temperature: number;
};

export const PROFILES: Record<Difficulty, BotProfile> = {
  easy: {
    attention: 0.85,
    damage: 0.5,
    familiarity: 0.3,
    approach: 0.15,
    perimeter: 0.1,
    holes: 0.2,
    baseLayers: 1,
    threatReach: 3,
    goalPull: 0.15,
    placements: 1,
    temperature: 0.25,
    candidateWords: 30,
    recallPower: 2,
    maxGuessLength: 3,
  },
  medium: {
    attention: 0.95,
    damage: 0.7,
    familiarity: 0.3,
    approach: 0.3,
    perimeter: 0.2,
    holes: 0.4,
    baseLayers: 2,
    threatReach: 3,
    goalPull: 0.3,
    placements: 3,
    temperature: 0.15,
    candidateWords: 40,
    recallPower: 1.5,
    maxGuessLength: 4,
  },
  hard: {
    attention: 0.97,
    damage: 1,
    familiarity: 0.2,
    approach: 0.5,
    perimeter: 0.3,
    holes: 0.6,
    baseLayers: 3,
    threatReach: 4,
    goalPull: 0.6,
    placements: 6,
    temperature: 0.1,
    candidateWords: 40,
    recallPower: 1,
    maxGuessLength: 5,
  },
};
