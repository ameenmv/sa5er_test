/**
 * Dynamic Cache — Layer 2
 * 
 * Stores previously-seen error → response mappings in ~/.sa5er/cache.json.
 * This layer saves API calls for errors that have been translated by Gemini before.
 * 
 * Cache entries are keyed by a normalized hash of the stderr string.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { SA5ER_DIR } from '../utils/config.js';

/** Path to the dynamic cache file */
const CACHE_PATH = path.join(SA5ER_DIR, 'cache.json');

/**
 * Creates a short, deterministic hash of the error string.
 * We normalize whitespace before hashing so minor formatting
 * differences don't create duplicate entries.
 * 
 * @param {string} error 
 * @returns {string} A hex hash string
 */
function hashError(error) {
  const normalized = error.trim().replace(/\s+/g, ' ').toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 32);
}

/**
 * Reads the full cache object from disk.
 * Returns an empty object if the file doesn't exist or is corrupt.
 * 
 * @returns {Record<string, { sarcasm: string, fix: string, timestamp: string }>}
 */
function readCache() {
  if (!fs.existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

/**
 * Writes the full cache object to disk.
 * @param {object} cache 
 */
function writeCache(cache) {
  // Ensure directory exists
  if (!fs.existsSync(SA5ER_DIR)) {
    fs.mkdirSync(SA5ER_DIR, { recursive: true });
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
}

/**
 * Looks up a cached response for the given error string.
 * 
 * @param {string} error - The raw stderr output
 * @returns {{ sarcasm: string, fix: string } | null} Cached response or null
 */
export function getCachedResponse(error) {
  const cache = readCache();
  const key = hashError(error);
  const entry = cache[key];

  if (entry) {
    return { sarcasm: entry.sarcasm, fix: entry.fix };
  }

  return null;
}

/**
 * Saves a new error → response mapping to the cache.
 * 
 * @param {string} error - The raw stderr output
 * @param {{ sarcasm: string, fix: string }} response - The AI-generated response
 */
export function setCachedResponse(error, response) {
  const cache = readCache();
  const key = hashError(error);

  cache[key] = {
    sarcasm: response.sarcasm,
    fix: response.fix,
    originalError: error.trim().substring(0, 200), // Keep a snippet for debugging
    timestamp: new Date().toISOString(),
  };

  writeCache(cache);
}

/**
 * Clears the entire cache. Useful for debugging or when cache grows too large.
 */
export function clearCache() {
  writeCache({});
}

/**
 * Returns the number of entries currently in the cache.
 * @returns {number}
 */
export function getCacheSize() {
  const cache = readCache();
  return Object.keys(cache).length;
}
