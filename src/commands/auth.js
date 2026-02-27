/**
 * Auth Command Handler
 * 
 * Saves the user's API key to ~/.sa5er/config.json.
 * Auto-detects provider: Groq (gsk_*) or Gemini (AIza*).
 * 
 * Usage: sa5er auth <YOUR_API_KEY>
 */

import { detectProvider, getApiKey, setApiKey, setProvider } from '../utils/config.js';
import { showInfo, showSuccess, showWarning } from '../utils/display.js';

/**
 * Handles the `sa5er auth <key>` command.
 * @param {string} key - The API key to save
 */
export function handleAuth(key) {
  if (!key || key.trim().length === 0) {
    showWarning('لازم تدّي الـ API Key! مثال:');
    showInfo('sa5er auth AIzaSyXXXXXXXXXXXXXX   (Gemini)');
    showInfo('sa5er auth gsk_XXXXXXXXXXXXXXXX    (Groq - مجاني!)');
    process.exit(1);
  }

  const existingKey = getApiKey();
  const provider = detectProvider(key.trim());
  
  setApiKey(key.trim());
  setProvider(provider);

  const providerName = provider === 'groq' ? 'Groq 🟢 (مجاني!)' : 'Gemini 🔵';

  if (existingKey) {
    showSuccess(`تم تحديث الـ API Key بنجاح! 🔄 (Provider: ${providerName})`);
  } else {
    showSuccess(`تم حفظ الـ API Key بنجاح! 🎉 (Provider: ${providerName})`);
  }

  showInfo('دلوقتي تقدر تشغل أي أمر كده: sa5er npm run build');
}
