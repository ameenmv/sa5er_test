<div align="center">

# ⚡ Sa5er CLI

### Your Sarcastic Egyptian Senior Developer 🇪🇬

**A CLI tool that wraps terminal commands. When they fail, it explains the error with Egyptian humor and provides the actual fix.**

[![npm version](https://img.shields.io/npm/v/sa5er-cli.svg?style=flat-square)](https://www.npmjs.com/package/sa5er-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg?style=flat-square)](https://nodejs.org)

<br>

<img width="700" alt="Sa5er Demo" src="https://i.imgur.com/placeholder.png">

</div>

---

## 🤔 What is Sa5er?

**Sa5er** (ساخر — meaning "sarcastic" in Arabic) is a CLI wrapper that runs any terminal command. If the command fails, Sa5er intercepts the error and gives you:

1. 😏 **A sarcastic explanation** in Egyptian Arabic (like a senior dev roasting you at the office)
2. ✅ **The actual fix** with clear, actionable steps

Instead of Googling cryptic error messages, just prefix your command with `sa5er` and let the Egyptian senior handle it!

---

## 🚀 Quick Start

```bash
# Install globally
npm install -g sa5er-cli

# (Optional) Add AI key for unknown errors — Groq is FREE!
sa5er auth gsk_YOUR_GROQ_KEY

# Use it!
sa5er npm run build
sa5er node app.js
sa5er git push origin main
```

> 💡 **Get a free Groq API key:** [console.groq.com/keys](https://console.groq.com/keys)
> Sa5er works **without** an API key for 40+ common errors!

---

## 📸 Examples

### ❌ Missing npm script
```
$ sa5er npm run doesnotexist

  ❌ الأمر فشل! (exit code: 1)

  ╔══════════════════════════════════════════╗
  ║  🚨 Sa5er Error Handler                  ║
  ╠══════════════════════════════════════════╣
  ║                                          ║
  ║  😏 رأي السينيور:                        ║
  ║  يا عم، إنت بتشغّل سكريبت مش موجود     ║
  ║  في الـ package.json! 😂                 ║
  ║                                          ║
  ║  ✅ الحل:                                ║
  ║  1. افتح package.json وشوف الـ scripts   ║
  ║  2. تأكد من اسم السكريبت                ║
  ║  3. جرب npm run عشان تشوف المتاح        ║
  ║                                          ║
  ║  [من الأرشيف 📚]                         ║
  ╚══════════════════════════════════════════╝
```

### ❌ File not found
```
$ sa5er node app.js

  😏 "الموديول ده اختفى زي ما بتختفي السحلية ورا التلاجة! 🦎"
```

### ❌ Git in wrong directory
```
$ sa5er git push origin main

  😏 "يا باشا، إنت مش في git repo أصلاً! 😂 ده زي ما تطلب قهوة في صيدلية!"
```

---

## 🧠 How It Works — 3-Tier Error Handling

Sa5er uses a smart 3-tier system to minimize API calls:

```
Command fails → stderr captured
       │
       ├── 🔍 Layer 1: Local Error Database (40+ patterns)
       │     └── Instant! No internet needed
       │
       ├── 🔍 Layer 2: Dynamic Cache (~/.sa5er/cache.json)
       │     └── Previously seen errors, instant response
       │
       └── 🤖 Layer 3: AI (Groq/Gemini)
             └── Unknown errors → AI explains → cached for next time
```

| Layer | Speed | Internet | API Key |
|-------|-------|----------|---------|
| 1. Error DB | ⚡ Instant | ❌ No | ❌ No |
| 2. Cache | ⚡ Instant | ❌ No | ❌ No |
| 3. AI | ~2 seconds | ✅ Yes | ✅ Yes |

> **Most common errors are handled by Layer 1 — no API key needed!**

---

## 🔑 Authentication

Sa5er supports two AI providers for Layer 3:

### Option 1: Groq (Recommended — Free! ✅)

```bash
# 1. Get a free key from: https://console.groq.com/keys
# 2. Save it:
sa5er auth gsk_YOUR_GROQ_KEY
```

- ✅ **Free** — 14,400 requests/day
- ✅ **Fast** — powered by custom LPU chips
- ✅ **Global** — works everywhere
- Uses **Llama 3.3 70B** model

### Option 2: Google Gemini

```bash
# 1. Get a key from: https://aistudio.google.com/app/apikey
# 2. Save it:
sa5er auth AIzaSyXXXXXXXXXX
```

- May require billing in some regions
- Uses **Gemini 2.0 Flash** model
- Auto-fallback to Gemini 2.0 Flash Lite

> **Auto-detection:** Sa5er automatically detects the provider from your key format (`gsk_` → Groq, `AIza` → Gemini)

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `sa5er <command>` | Run any terminal command with error handling |
| `sa5er auth <key>` | Save your AI API key (Groq or Gemini) |
| `sa5er cache` | Show cache statistics |
| `sa5er cache-clear` | Clear the error cache |
| `sa5er --help` | Show help |
| `sa5er --version` | Show version |

---

## 📦 Built-in Error Patterns (Layer 1)

Sa5er recognizes **40+ common errors** without needing any API key:

<details>
<summary>Click to see all supported error patterns</summary>

| Category | Errors |
|----------|--------|
| **Node.js** | `MODULE_NOT_FOUND`, `SyntaxError`, `ReferenceError`, `TypeError`, `Maximum call stack size exceeded` |
| **npm** | Missing script, `ERESOLVE`, `ELIFECYCLE`, deprecated warnings, audit vulnerabilities |
| **Git** | Not a git repository, merge conflicts, authentication failed |
| **Network** | `ECONNREFUSED`, `ETIMEDOUT`, `CORS`, `ECONNRESET` |
| **File System** | `ENOENT`, `EACCES`, `EPERM`, `ENOSPC`, `ENAMETOOLONG` |
| **React** | Hydration errors, invalid hook calls, key prop warnings |
| **Next.js** | SSR/SSG errors, prerendering failures |
| **TypeScript** | Type errors, `TS2345`, `TS2322`, file extension issues |
| **Build Tools** | Vite, Webpack, esbuild, Rollup errors |
| **Docker** | Daemon not running, image not found |
| **Python** | `ModuleNotFoundError`, `pip not found` |
| **SSH** | Connection refused, permission denied, host key verification |
| **Database** | Connection refused on common ports |
| **ESLint** | Parsing errors, rule violations |
| **Environment** | Missing `.env` variables, `REACT_APP_`, `VITE_`, `NEXT_PUBLIC_` |
| **Windows** | PowerShell execution policy, path too long |
| **Security** | OpenSSL errors (`ERR_OSSL_EVP_UNSUPPORTED`) |

</details>

---

## 🏗️ Architecture

```
sa5er-cli/
├── bin/sa5er.js           # CLI entry point
├── src/
│   ├── index.js           # CLI router (Commander.js)
│   ├── commands/
│   │   ├── auth.js        # API key management
│   │   └── run.js         # Command execution + 3-tier system
│   ├── services/
│   │   ├── errorMatcher.js # Layer 1: Regex pattern matching
│   │   ├── cache.js        # Layer 2: SHA-256 hashed cache
│   │   └── gemini.js       # Layer 3: AI (Groq + Gemini)
│   ├── utils/
│   │   ├── config.js      # Config management (~/.sa5er/)
│   │   ├── display.js     # Terminal UI + colored boxes
│   │   └── bidi.js        # Arabic text rendering (RTL + shaping)
│   └── data/
│       └── errors.json    # 40+ pre-loaded error patterns
└── package.json
```

---

## 🌍 Arabic Text Rendering

Sa5er properly renders Arabic text in terminals that don't natively support RTL:

- **Letter Shaping** — Uses `arabic-reshaper` to connect Arabic letters (Presentation Forms)
- **Bidi Reordering** — Uses `bidi-js` (Unicode Bidirectional Algorithm) to display RTL text correctly in LTR terminals
- **Mixed Text** — English words (like `package.json`) stay LTR within Arabic sentences

---

## 🤝 Contributing

Want to add more error patterns? Edit `src/data/errors.json`:

```json
{
  "pattern": "your regex pattern here",
  "response": {
    "sarcasm": "تعليق ساخر بالعربي المصري 😂",
    "fix": "1. الخطوة الأولى\n2. الخطوة التانية"
  }
}
```

Pull requests are welcome! 🎉

---

## 📄 License

MIT © Sa5er CLI

---

<div align="center">

**Made with ☕ and Egyptian humor**

*يلا يا هندسة، الكود مش هيكتب نفسه!* 🇪🇬

</div>
