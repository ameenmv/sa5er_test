/**
 * Config Manager
 * 
 * Handles reading/writing the user's configuration file at ~/.sa5er/config.json.
 * Supports multiple AI providers: Gemini and Groq.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

/** Base directory for Sa5er config and cache files */
const SA5ER_DIR = path.join(os.homedir(), '.sa5er');

/** Path to the config file */
const CONFIG_PATH = path.join(SA5ER_DIR, 'config.json');

function ensureDir() {
  if (!fs.existsSync(SA5ER_DIR)) {
    fs.mkdirSync(SA5ER_DIR, { recursive: true });
  }
}

export function readConfig() {
  ensureDir();
  if (!fs.existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

export function writeConfig(config) {
  ensureDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export function getApiKey() {
  const config = readConfig();
  return config.apiKey || null;
}

export function setApiKey(key) {
  const config = readConfig();
  config.apiKey = key;
  writeConfig(config);
}

/**
 * Auto-detects the AI provider from the API key format.
 * - Keys starting with 'gsk_' → Groq
 * - Keys starting with 'AIza' → Gemini
 */
export function detectProvider(key) {
  if (key.startsWith('gsk_')) return 'groq';
  if (key.startsWith('AIza')) return 'gemini';
  return 'gemini';
}

export function getProvider() {
  const config = readConfig();
  return config.provider || 'gemini';
}

export function setProvider(provider) {
  const config = readConfig();
  config.provider = provider;
  writeConfig(config);
}

export { SA5ER_DIR };

