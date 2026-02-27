/**
 * Error Matcher — Layer 1 (Pre-loaded DB)
 * 
 * Checks the stderr output against regex patterns in errors.json.
 * This is the fastest layer and requires no API calls.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Path to the built-in error patterns database */
const ERRORS_DB_PATH = path.join(__dirname, '..', 'data', 'errors.json');

/** Cached pattern entries — loaded once on first call */
let patternsCache = null;

/**
 * Loads and compiles all error patterns from errors.json.
 * Patterns are compiled to RegExp objects on first load and cached.
 * 
 * @returns {Array<{ regex: RegExp, response: { sarcasm: string, fix: string } }>}
 */
function loadPatterns() {
  if (patternsCache) return patternsCache;

  try {
    const raw = fs.readFileSync(ERRORS_DB_PATH, 'utf-8');
    const entries = JSON.parse(raw);

    patternsCache = entries.map(entry => ({
      regex: new RegExp(entry.pattern, 'i'),
      response: entry.response,
    }));
  } catch (err) {
    console.error(`[Sa5er] Warning: Could not load errors.json — ${err.message}`);
    patternsCache = [];
  }

  return patternsCache;
}

/**
 * Attempts to match a stderr string against the pre-loaded error patterns.
 * 
 * @param {string} stderr - The raw stderr output from the failed command.
 * @returns {{ sarcasm: string, fix: string } | null} The response if matched, or null.
 */
export function matchError(stderr) {
  const patterns = loadPatterns();

  for (const { regex, response } of patterns) {
    if (regex.test(stderr)) {
      return response;
    }
  }

  return null;
}
