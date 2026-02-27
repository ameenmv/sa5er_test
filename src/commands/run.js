/**
 * Run Command Handler
 * 
 * Executes any terminal command via `spawn`, streams stdout in real time,
 * and if the command fails (exit code > 0), runs stderr through the
 * 3-tier error handling system.
 * 
 * Usage: sa5er <any_terminal_command>
 * Example: sa5er npm run build
 */

import { spawn } from 'child_process';
import pc from 'picocolors';
import { getCachedResponse, setCachedResponse } from '../services/cache.js';
import { matchError } from '../services/errorMatcher.js';
import { askGemini } from '../services/gemini.js';
import { reshapeForTerminal } from '../utils/bidi.js';
import { displayError, showBanner, showFatal, showInfo, showWarning } from '../utils/display.js';

/**
 * Executes the given command and arguments, streaming stdout to the terminal.
 * On failure, processes stderr through the 3-tier fallback system.
 * 
 * @param {string[]} args - The full command + arguments (e.g. ['npm', 'run', 'build'])
 */
export async function handleRun(args) {
  if (!args || args.length === 0) {
    showBanner();
    showWarning('لازم تكتب أمر! 😅');
    showInfo('مثال: sa5er npm run build');
    showInfo('       sa5er node app.js');
    showInfo('       sa5er git push origin main');
    process.exit(1);
  }

  const fullCommand = args.join(' ');

  // Display what we're running
  console.log(pc.dim(`\n  ⚡ Sa5er is running: ${pc.bold(fullCommand)}\n`));
  console.log(pc.dim('  ' + '─'.repeat(50)));
  console.log('');

  // Spawn the child process
  // On Windows, we need shell: true to resolve commands like npm, git, etc.
  // We pass the entire command as a single string to avoid DEP0190 warning.
  const child = spawn(fullCommand, [], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env },
  });

  // Collect stderr chunks
  let stderrBuffer = '';

  // Stream stdout to the terminal in real time
  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk);
  });

  // Collect stderr but also show it in real time (dimmed)
  child.stderr.on('data', (chunk) => {
    stderrBuffer += chunk.toString();
    // Still show stderr in real time so the user knows what's happening
    process.stderr.write(pc.dim(chunk.toString()));
  });

  // Wait for the process to exit
  const exitCode = await new Promise((resolve) => {
    child.on('close', (code) => resolve(code ?? 1));
    child.on('error', (err) => {
      stderrBuffer += err.message;
      resolve(1);
    });
  });

  // If the command succeeded, we're done!
  if (exitCode === 0) {
    console.log('');
    console.log(pc.green(`  ✅ ${reshapeForTerminal('الأمر خلص بنجاح!')} (exit code: 0)`));
    console.log('');
    return;
  }

  // ─── Command Failed — Run the 3-Tier System ───────────────────────
  console.log('');
  console.log(pc.red(`  ❌ ${reshapeForTerminal('الأمر فشل!')} (exit code: ${exitCode})`));

  if (!stderrBuffer.trim()) {
    showWarning('مفيش stderr واضح. الأمر فشل بس مبعتش رسالة خطأ مفصلة.');
    showInfo(`Exit code: ${exitCode}`);
    return;
  }

  // ── Layer 1: Pre-loaded DB ──
  const dbMatch = matchError(stderrBuffer);
  if (dbMatch) {
    displayError(stderrBuffer, dbMatch.sarcasm, dbMatch.fix, 'db');
    return;
  }

  // ── Layer 2: Local Dynamic Cache ──
  const cachedMatch = getCachedResponse(stderrBuffer);
  if (cachedMatch) {
    displayError(stderrBuffer, cachedMatch.sarcasm, cachedMatch.fix, 'cache');
    return;
  }

  // ── Layer 3: Gemini API ──
  console.log(pc.cyan(`\n  🤖 ${reshapeForTerminal('بسأل الذكاء الاصطناعي... استنى ثانية...')}`));

  try {
    const geminiResponse = await askGemini(stderrBuffer);
    
    // Save to cache for future use (Layer 2)
    setCachedResponse(stderrBuffer, geminiResponse);

    displayError(stderrBuffer, geminiResponse.sarcasm, geminiResponse.fix, 'gemini');
  } catch (err) {
    showFatal(err.message);
    
    // Still show the raw error so the user isn't stuck
    console.log(pc.dim('  ─── Raw stderr ───'));
    console.log(pc.red(`  ${stderrBuffer.trim()}`));
    console.log('');
  }
}
