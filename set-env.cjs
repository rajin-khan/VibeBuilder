/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

// Get the environment argument, defaulting to "development"
const env = process.env.BUILD_ENV || 'dev'; // Options: development, stg, production

// Define the corresponding environment file
const envFile = `.env.${env}`;
const targetFile = path.join(__dirname, '.env');

// In CI (e.g. Selise Blocks Docker build), secrets come from injected env vars, not a committed file.
if (!fs.existsSync(envFile)) {
  console.warn(
    `⚠️  ${envFile} not found — skipping copy. Vite will use VITE_* from the environment (CI/Blocks Cloud).`
  );
  process.exit(0);
}

fs.copyFileSync(envFile, targetFile);
console.log(`✅ Successfully set environment: ${envFile} → .env`);
