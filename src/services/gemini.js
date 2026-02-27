/**
 * AI Service — Layer 3
 * 
 * Supports two providers:
 * - Groq (free, works globally, fast) — uses Llama 3.3 70B
 * - Gemini (Google, may need billing in some regions)
 * 
 * Auto-detects provider from the saved config.
 */

import { getApiKey, getProvider } from '../utils/config.js';

/** The system instruction for the AI model */
const SYSTEM_INSTRUCTION = `You are an Egyptian Senior Software Engineer. You are sarcastic but helpful. Your job is to explain terminal errors to junior developers using Egyptian street/coffee shop slang and humor. First, mock the error lightly in Egyptian Arabic, then provide the exact technical solution clearly. Keep it concise.

IMPORTANT: You MUST respond in this exact JSON format and nothing else:
{
  "sarcasm": "<your sarcastic Egyptian Arabic comment here>",
  "fix": "<the technical solution here>"
}

Rules:
- The "sarcasm" field must be in Egyptian Arabic with humor and emojis.
- The "fix" field should be clear technical steps, can mix Arabic and English for technical terms.
- Do NOT include any text outside the JSON object.
- Keep both fields concise (2-4 sentences max each).`;

// ═══════════════════════════════════════════════
//  GROQ PROVIDER (Free, works globally)
// ═══════════════════════════════════════════════

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function askGroq(apiKey, errorText) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: `The following terminal command failed with this error. Explain it:\n\n${errorText}` },
      ],
      temperature: 0.9,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    
    if (response.status === 401) {
      throw new Error('الـ Groq API Key مش صحيح! جرب تعمل auth تاني:\n  sa5er auth gsk_XXXXXXXX');
    }
    if (response.status === 429) {
      throw new Error('الـ Groq rate limit اتعدى! 😅 استنى دقيقة وجرب تاني.');
    }
    throw new Error(`Groq API Error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;
  
  if (!rawText) throw new Error('Groq returned an empty response.');
  
  return parseAIResponse(rawText);
}

// ═══════════════════════════════════════════════
//  GEMINI PROVIDER
// ═══════════════════════════════════════════════

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

async function askGeminiProvider(apiKey, errorText) {
  const requestBody = {
    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{
      parts: [{ text: `The following terminal command failed with this error. Explain it:\n\n${errorText}` }],
    }],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 500,
      responseMimeType: 'application/json',
    },
  };

  let response;

  for (const model of GEMINI_MODELS) {
    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) break;
    if (response.status === 429) continue;
    break;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('الـ Gemini API Key مش صحيح! جرب:\n  sa5er auth <YOUR_NEW_KEY>');
    }
    if (response.status === 429) {
      throw new Error(
        'الـ Gemini quota خلصت! 😅 جرب Groq بدله (مجاني!):\n' +
        '  1. روح على: https://console.groq.com/keys\n' +
        '  2. اعمل API Key مجاني\n' +
        '  3. شغّل: sa5er auth gsk_YOUR_GROQ_KEY'
      );
    }
    const errBody = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!rawText) throw new Error('Gemini returned an empty response.');
  
  return parseAIResponse(rawText);
}

// ═══════════════════════════════════════════════
//  SHARED: Parse AI response
// ═══════════════════════════════════════════════

function parseAIResponse(rawText) {
  try {
    const parsed = JSON.parse(rawText);
    return {
      sarcasm: parsed.sarcasm || 'الـ AI مبعتش سخرية... غريبة! 🤔',
      fix: parsed.fix || rawText,
    };
  } catch {
    return {
      sarcasm: 'الـ AI رد بس مش بالشكل المتوقع... بردو هنساعدك! �',
      fix: rawText.trim(),
    };
  }
}

// ═══════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════

/**
 * Sends an error to the configured AI provider.
 * @param {string} errorText - The raw stderr output
 * @returns {Promise<{ sarcasm: string, fix: string }>}
 */
export async function askGemini(errorText) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      'مفيش API Key محفوظ! شغّل واحد من الأوامر دي:\n' +
      '  sa5er auth gsk_XXXXXXXX    (Groq - مجاني! ✅)\n' +
      '  sa5er auth AIzaSyXXXXXXXX  (Gemini)\n\n' +
      '  للـ Groq المجاني: https://console.groq.com/keys'
    );
  }

  const provider = getProvider();

  if (provider === 'groq') {
    return askGroq(apiKey, errorText);
  } else {
    return askGeminiProvider(apiKey, errorText);
  }
}
