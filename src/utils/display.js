/**
 * Display Utilities
 * 
 * Pretty-prints sarcastic error explanations and other CLI output
 * using picocolors for terminal styling.
 * 
 * All Arabic text is processed through reshapeForTerminal() before
 * printing, which handles letter shaping (connecting Arabic letters)
 * and bidi reordering (correct visual RTL order in LTR terminals).
 */

import pc from 'picocolors';
import { reshapeForTerminal } from './bidi.js';

/** Decorative box border characters */
const BOX = {
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  horizontal: '═',
  vertical: '║',
  teeLeft: '╠',
  teeRight: '╣',
};

/**
 * Returns a horizontal line of the given width.
 * @param {number} width 
 */
function hLine(width) {
  return BOX.horizontal.repeat(width);
}

/**
 * Pads a string with spaces on the right to fill `width` characters.
 * Handles multi-byte (Arabic) characters by using a simple approach.
 */
function padRight(str, width) {
  // Use visual length approximation — for terminal, just use string length
  const pad = Math.max(0, width - stripAnsi(str).length);
  return str + ' '.repeat(pad);
}

/**
 * Strips ANSI escape codes from a string (for length calculation).
 */
function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[[0-9;]*m/g, '');
}

/**
 * Wraps text to a max width, respecting word boundaries.
 * @param {string} text 
 * @param {number} maxWidth 
 * @returns {string[]}
 */
function wrapText(text, maxWidth) {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    if (paragraph.length <= maxWidth) {
      lines.push(paragraph);
      continue;
    }
    const words = paragraph.split(' ');
    let currentLine = '';
    for (const word of words) {
      if (currentLine.length + word.length + 1 > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

/**
 * Displays the Sa5er banner.
 */
export function showBanner() {
  console.log('');
  console.log(pc.bold(pc.yellow(`  ⚡ Sa5er - ${reshapeForTerminal('ساخر')} CLI ⚡`)));
  console.log(pc.dim('  Your sarcastic Egyptian senior developer 🇪🇬'));
  console.log('');
}

/**
 * Displays a sarcastic error explanation in a styled box.
 * 
 * @param {string} originalError - The raw stderr output
 * @param {string} sarcasm - The sarcastic comment in Egyptian Arabic
 * @param {string} fix - The technical fix/solution
 * @param {string} source - Where the response came from: 'db', 'cache', or 'gemini'
 */
export function displayError(originalError, sarcasm, fix, source) {
  const width = Math.min(process.stdout.columns || 80, 90) - 4;
  const sourceLabels = {
    db: pc.dim(`[${reshapeForTerminal('من الأرشيف')} 📚]`),
    cache: pc.dim(`[${reshapeForTerminal('من الكاش')} 💾]`),
    gemini: pc.dim(`[${reshapeForTerminal('من الذكاء الاصطناعي')} 🤖]`),
  };

  console.log('');
  console.log(pc.red(`${BOX.topLeft}${hLine(width + 2)}${BOX.topRight}`));
  console.log(pc.red(`${BOX.vertical} ${padRight(pc.bold(' 🚨 Sa5er Error Handler'), width + 1)}${BOX.vertical}`));
  console.log(pc.red(`${BOX.teeLeft}${hLine(width + 2)}${BOX.teeRight}`));

  // Original error (truncated if too long)
  const truncatedError = originalError.length > 300
    ? originalError.substring(0, 300) + '...'
    : originalError;

  console.log(pc.red(`${BOX.vertical}${' '.repeat(width + 2)}${BOX.vertical}`));
  const errorLabel = pc.bold(pc.red(` ❌ ${reshapeForTerminal('الخطأ الأصلي:')}`));
  console.log(pc.red(`${BOX.vertical} ${padRight(errorLabel, width + 1)}${BOX.vertical}`));
  
  for (const line of wrapText(truncatedError.trim(), width - 2)) {
    console.log(pc.red(`${BOX.vertical}  ${padRight(pc.white(line), width)}${BOX.vertical}`));
  }

  console.log(pc.red(`${BOX.vertical}${' '.repeat(width + 2)}${BOX.vertical}`));
  console.log(pc.yellow(`${BOX.teeLeft}${hLine(width + 2)}${BOX.teeRight}`));

  // Sarcastic comment
  console.log(pc.yellow(`${BOX.vertical}${' '.repeat(width + 2)}${BOX.vertical}`));
  const sarLabel = pc.bold(pc.yellow(` 😏 ${reshapeForTerminal('رأي السينيور:')}`));
  console.log(pc.yellow(`${BOX.vertical} ${padRight(sarLabel, width + 1)}${BOX.vertical}`));
  
  for (const line of wrapText(sarcasm.trim(), width - 2)) {
    console.log(pc.yellow(`${BOX.vertical}  ${padRight(pc.white(reshapeForTerminal(line)), width)}${BOX.vertical}`));
  }

  console.log(pc.yellow(`${BOX.vertical}${' '.repeat(width + 2)}${BOX.vertical}`));
  console.log(pc.green(`${BOX.teeLeft}${hLine(width + 2)}${BOX.teeRight}`));

  // Fix / Solution
  console.log(pc.green(`${BOX.vertical}${' '.repeat(width + 2)}${BOX.vertical}`));
  const fixLabel = pc.bold(pc.green(` ✅ ${reshapeForTerminal('الحل:')}`));
  console.log(pc.green(`${BOX.vertical} ${padRight(fixLabel, width + 1)}${BOX.vertical}`));
  
  for (const line of wrapText(fix.trim(), width - 2)) {
    console.log(pc.green(`${BOX.vertical}  ${padRight(pc.cyan(reshapeForTerminal(line)), width)}${BOX.vertical}`));
  }

  console.log(pc.green(`${BOX.vertical}${' '.repeat(width + 2)}${BOX.vertical}`));

  // Source label
  const srcLabel = `  ${sourceLabels[source] || ''}`;
  console.log(pc.green(`${BOX.vertical} ${padRight(srcLabel, width + 1)}${BOX.vertical}`));
  
  console.log(pc.green(`${BOX.bottomLeft}${hLine(width + 2)}${BOX.bottomRight}`));
  console.log('');
}

/**
 * Prints a success message.
 * @param {string} message 
 */
export function showSuccess(message) {
  console.log(pc.green(`\n  ✅ ${reshapeForTerminal(message)}\n`));
}

/**
 * Prints a warning message.
 * @param {string} message 
 */
export function showWarning(message) {
  console.log(pc.yellow(`\n  ⚠️  ${reshapeForTerminal(message)}\n`));
}

/**
 * Prints an info message.
 * @param {string} message 
 */
export function showInfo(message) {
  console.log(pc.cyan(`\n  ℹ️  ${reshapeForTerminal(message)}\n`));
}

/**
 * Prints a fatal/critical error message.
 * @param {string} message 
 */
export function showFatal(message) {
  console.log(pc.bold(pc.red(`\n  💀 ${reshapeForTerminal(message)}\n`)));
}
