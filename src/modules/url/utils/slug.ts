import { randomInt } from 'node:crypto';
import { ALPHABET } from './constants.js';

const DEFAULT_SLUG_LENGTH = 7;

/**
 * Generates a random slug from the shared alphabet.
 *
 * `randomInt` comes from `node:crypto`: `Math.random()` is predictable, so it
 * would let anyone guess other people's links. It is also uniform, unlike
 * `byte % ALPHABET.length`, which favours the first characters of the alphabet.
 */
export function generateSlug(length: number = DEFAULT_SLUG_LENGTH): string {
  let slug = '';

  for (let position = 0; position < length; position += 1) {
    slug += ALPHABET[randomInt(ALPHABET.length)];
  }

  return slug;
}
