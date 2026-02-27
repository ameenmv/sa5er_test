#!/usr/bin/env node

/**
 * Sa5er CLI - Entry Point
 * 
 * This is the main executable that gets registered as the "sa5er" command
 * when the package is installed globally via `npm link` or `npm install -g`.
 * 
 * Usage:
 *   sa5er auth <API_KEY>       - Save your Gemini API key
 *   sa5er <any command>        - Run a command with sarcastic error handling
 * 
 * Examples:
 *   sa5er auth AIzaSy...       - Authenticate with Gemini
 *   sa5er npm run build        - Run npm build with Sa5er error handling
 *   sa5er node app.js          - Run a Node.js app with Sa5er
 *   sa5er git push origin main - Push to git with Sa5er
 */

import { createCLI } from '../src/index.js';

createCLI();
