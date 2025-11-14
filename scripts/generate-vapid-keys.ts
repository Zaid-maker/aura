#!/usr/bin/env bun

/**
 * Generate VAPID keys for PWA push notifications
 * Run: bun scripts/generate-vapid-keys.ts
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function generateVapidKeys() {
  console.log("🔑 Generating VAPID keys for PWA push notifications...\n");

  try {
    // Check if web-push is installed
    try {
      await execAsync("npx web-push --version");
    } catch {
      console.log("📦 Installing web-push...\n");
      await execAsync("npm install -g web-push");
    }

    // Generate keys
    const { stdout } = await execAsync("npx web-push generate-vapid-keys");

    console.log("✅ VAPID keys generated successfully!\n");
    console.log("📋 Add these to your .env file:\n");
    console.log("─".repeat(60));
    console.log(stdout);
    console.log("─".repeat(60));
    console.log("\n⚠️  Important:");
    console.log("   - Keep the PRIVATE key secret!");
    console.log("   - Never commit these keys to version control");
    console.log("   - Add NEXT_PUBLIC_VAPID_PUBLIC_KEY for frontend access");
    console.log("   - Add your email as VAPID_SUBJECT\n");

    console.log("📝 Example .env configuration:\n");
    console.log("VAPID_PUBLIC_KEY=<your-public-key>");
    console.log("VAPID_PRIVATE_KEY=<your-private-key>");
    console.log("VAPID_SUBJECT=mailto:your-email@example.com");
    console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-public-key>\n");
  } catch (error) {
    console.error("❌ Error generating VAPID keys:", error);
    console.log("\n💡 Manual generation:");
    console.log("   1. Install: npm install -g web-push");
    console.log("   2. Run: npx web-push generate-vapid-keys");
    process.exit(1);
  }
}

generateVapidKeys();
