/**
 * Bidi & Arabic Shaping Utility
 * 
 * Handles two critical problems for displaying Arabic text in terminals:
 * 
 * 1. **Letter Shaping** — Arabic letters change form based on position
 *    (initial, medial, final, isolated). Terminals don't do this automatically.
 *    We use `arabic-reshaper` to convert to Unicode Presentation Forms.
 * 
 * 2. **Right-to-Left Ordering** — Terminals render left-to-right. We use
 *    `bidi-js` (Unicode Bidirectional Algorithm) to compute the correct
 *    visual ordering, keeping English/numbers LTR within the RTL context.
 */

import bidiFactory from 'bidi-js';
import { createRequire } from 'module';

// arabic-reshaper is CommonJS-only, so we need createRequire
const require = createRequire(import.meta.url);
const ArabicReshaper = require('arabic-reshaper');

// Initialize the bidi engine once
const bidi = bidiFactory();

/**
 * Checks whether a character is in an Arabic Unicode range.
 * @param {string} char 
 * @returns {boolean}
 */
function isArabicChar(char) {
  const code = char.codePointAt(0);
  return (
    (code >= 0x0600 && code <= 0x06FF) ||   // Arabic
    (code >= 0x0750 && code <= 0x077F) ||   // Arabic Supplement
    (code >= 0x08A0 && code <= 0x08FF) ||   // Arabic Extended-A
    (code >= 0xFB50 && code <= 0xFDFF) ||   // Arabic Presentation Forms-A
    (code >= 0xFE70 && code <= 0xFEFF)      // Arabic Presentation Forms-B
  );
}

/**
 * Checks whether a string contains any Arabic characters.
 * @param {string} text 
 * @returns {boolean}
 */
function hasArabic(text) {
  for (let i = 0; i < text.length; i++) {
    if (isArabicChar(text[i])) return true;
  }
  return false;
}

/**
 * Applies the Unicode Bidirectional Algorithm to reorder a single line
 * of text for correct visual display in a LTR terminal.
 * 
 * @param {string} line - A single line of text (no newlines)
 * @returns {string} The visually reordered line
 */
function applyBidiReorder(line) {
  if (line.length === 0) return line;

  // Get embedding levels — force RTL base direction since our content is Arabic-primary
  const embeddingLevels = bidi.getEmbeddingLevels(line, 'rtl');

  // Get the segments that need to be flipped
  const flips = bidi.getReorderSegments(line, embeddingLevels);

  // Get mirrored characters (e.g., parentheses swap in RTL context)
  const mirrored = bidi.getMirroredCharactersMap(line, embeddingLevels);

  // Convert to array of characters for in-place manipulation
  const chars = [...line];

  // Apply mirroring first
  mirrored.forEach((replacement, index) => {
    chars[index] = replacement;
  });

  // Apply all flips (reversals) in order
  flips.forEach(([start, end]) => {
    // Reverse the segment in-place
    let left = start;
    let right = end;
    while (left < right) {
      const temp = chars[left];
      chars[left] = chars[right];
      chars[right] = temp;
      left++;
      right--;
    }
  });

  return chars.join('');
}

/**
 * Processes a string containing Arabic text for correct terminal display.
 * 
 * This function:
 * 1. Reshapes Arabic letters (connects them using Presentation Forms)
 * 2. Applies the Unicode Bidi Algorithm for correct visual ordering
 * 3. Handles mixed Arabic/English text properly
 * 
 * Each line is processed independently (bidi is per-line).
 * Lines without Arabic text are returned unchanged.
 * 
 * @param {string} text - The input text (may contain newlines)
 * @returns {string} The text ready for terminal display
 */
export function reshapeForTerminal(text) {
  if (!text || !hasArabic(text)) return text;

  return text
    .split('\n')
    .map(line => {
      if (!hasArabic(line)) return line;

      // Step 1: Reshape Arabic characters (connect letters)
      const reshaped = ArabicReshaper.convertArabic(line);

      // Step 2: Apply bidi algorithm for correct visual order
      const reordered = applyBidiReorder(reshaped);

      return reordered;
    })
    .join('\n');
}

export { hasArabic };
