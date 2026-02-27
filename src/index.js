/**
 * Sa5er CLI — Main Entry Point
 * 
 * Sets up the CLI using Commander.js with two modes:
 * 1. `sa5er auth <key>` — Save the Gemini API key
 * 2. `sa5er <command...>` — Run any terminal command with sarcastic error handling
 * 
 * ═══════════════════════════════════════════════════════
 *  HOW TO INSTALL & TEST LOCALLY:
 * ═══════════════════════════════════════════════════════
 * 
 *  1. Navigate to the project directory:
 *     cd c:\ameen\sa5er
 * 
 *  2. Install dependencies:
 *     npm install
 * 
 *  3. Link the CLI globally (creates "sa5er" command):
 *     npm link
 * 
 *  4. Authenticate with your Gemini API key:
 *     sa5er auth YOUR_API_KEY_HERE
 * 
 *  5. Test with a command that will fail:
 *     sa5er node nonexistent.js
 *     sa5er npm run doesnotexist
 *     sa5er git push origin main     (in a non-git directory)
 * 
 *  6. Test with a command that will succeed:
 *     sa5er echo "Hello from Sa5er!"
 *     sa5er node -e "console.log('marhaba!')"
 * 
 *  To unlink later:  npm unlink -g sa5er-cli
 * ═══════════════════════════════════════════════════════
 */

import { Command } from 'commander';
import { handleAuth } from './commands/auth.js';
import { handleRun } from './commands/run.js';
import { clearCache, getCacheSize } from './services/cache.js';
import { showBanner, showInfo, showSuccess } from './utils/display.js';

/**
 * Creates and configures the CLI program, then parses process.argv.
 */
export function createCLI() {
  const program = new Command();

  program
    .name('sa5er')
    .description('⚡ Sa5er CLI — Your sarcastic Egyptian senior developer 🇪🇬\nWraps terminal commands and explains errors with Egyptian humor.')
    .version('1.0.0', '-v, --version');

  // ── Auth Command ─────────────────────────────────────
  program
    .command('auth <apiKey>')
    .description('Save your Gemini API key for AI-powered error explanations')
    .action((apiKey) => {
      handleAuth(apiKey);
    });

  // ── Cache Management ──────────────────────────────────
  program
    .command('cache')
    .description('Show cache statistics')
    .action(() => {
      const size = getCacheSize();
      showInfo(`الكاش فيه ${size} إدخال(ات) محفوظة. 💾`);
    });

  program
    .command('cache-clear')
    .description('Clear the dynamic error cache')
    .action(() => {
      clearCache();
      showSuccess('تم مسح الكاش بالكامل! 🧹');
    });

  // ── Default: Run any command ──────────────────────────
  // Commander doesn't natively support "catch-all" well,
  // so we intercept unknown commands manually.

  // If the first argument is a known command, let Commander handle it
  const knownCommands = ['auth', 'cache', 'cache-clear', 'help', '-h', '--help', '-v', '--version', '-V'];
  const firstArg = process.argv[2];

  if (firstArg && !knownCommands.includes(firstArg)) {
    // This is a pass-through command — run it through Sa5er
    const commandArgs = process.argv.slice(2);
    showBanner();
    handleRun(commandArgs);
    return;
  }

  // No arguments at all — show the banner + help
  if (!firstArg) {
    showBanner();
  }

  program.parse(process.argv);
}
