#!/usr/bin/env npx tsx
/**
 * CLI Login Script — opens a browser logged into AdherePod
 *
 * Usage:
 *   npx tsx scripts/login.ts [options]
 *
 * Options:
 *   --env, -e       Environment: local | preview | prod (default: local)
 *   --url           Custom base URL (overrides --env)
 *   --user, -u      User preset: admin | doctor | patient (reads from .env.local)
 *   --email         Email address (overrides --user)
 *   --password      Password (overrides --user)
 *   --page, -p      Page to open after login: meds | provider | admin | home (default: auto by role)
 *   --port          Local dev server port (default: 3000)
 *
 * Examples:
 *   npx tsx scripts/login.ts                           # admin on localhost:3000
 *   npx tsx scripts/login.ts -u doctor                 # doctor on localhost:3000
 *   npx tsx scripts/login.ts -u doctor -e prod         # doctor on adherepod.com
 *   npx tsx scripts/login.ts -u doctor -p provider     # doctor → provider-dashboard
 *   npx tsx scripts/login.ts --email foo@bar.com --password yourpassword
 *   npx tsx scripts/login.ts --url https://preview-xyz.vercel.app -u admin
 */

import { chromium } from "playwright";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

// --- Parse args ---
const args = process.argv.slice(2);

function getArg(flags: string[]): string | undefined {
  for (const flag of flags) {
    const idx = args.indexOf(flag);
    if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  }
  return undefined;
}

function hasFlag(flags: string[]): boolean {
  return flags.some((f) => args.includes(f));
}

const envName = getArg(["--env", "-e"]) || "local";
const customUrl = getArg(["--url"]);
const userPreset = getArg(["--user", "-u"]) || "admin";
const emailOverride = getArg(["--email"]);
const passwordOverride = getArg(["--password"]);
const pageName = getArg(["--page", "-p"]);
const port = getArg(["--port"]) || "3000";

// --- Resolve base URL ---
function resolveBaseUrl(): string {
  if (customUrl) return customUrl.replace(/\/$/, "");
  switch (envName) {
    case "local":
      return `http://localhost:${port}`;
    case "prod":
    case "production":
      return "https://adherepod.com";
    default:
      // Treat as a Vercel preview URL slug
      if (envName.startsWith("http")) return envName.replace(/\/$/, "");
      return `https://${envName}.vercel.app`;
  }
}

// --- Resolve credentials ---
function resolveCredentials(): { email: string; password: string } {
  if (emailOverride && passwordOverride) {
    return { email: emailOverride, password: passwordOverride };
  }

  switch (userPreset) {
    case "admin":
      return {
        email: process.env.TEST_USER_EMAIL || "",
        password: process.env.TEST_USER_PASSWORD || "",
      };
    case "doctor":
    case "provider":
      return {
        email: process.env.TEST_DOCTOR_EMAIL || "",
        password: process.env.TEST_DOCTOR_PASSWORD || "",
      };
    case "patient":
      // Falls back to admin user if no separate patient creds exist
      return {
        email: process.env.TEST_PATIENT_EMAIL || process.env.TEST_USER_EMAIL || "",
        password: process.env.TEST_PATIENT_PASSWORD || process.env.TEST_USER_PASSWORD || "",
      };
    default:
      console.error(`Unknown user preset: "${userPreset}". Use: admin | doctor | patient`);
      process.exit(1);
  }
}

// --- Resolve target page ---
function resolveTargetPage(role: string): string {
  if (pageName) {
    switch (pageName) {
      case "meds":
      case "medications":
      case "my-medications":
        return "/my-medications";
      case "provider":
      case "provider-dashboard":
      case "care-team":
        return "/provider-dashboard";
      case "admin":
        return "/admin";
      case "home":
      case "homepage":
        return "/";
      default:
        // Treat as a raw path
        return pageName.startsWith("/") ? pageName : `/${pageName}`;
    }
  }
  // Auto-detect by role/preset
  if (role === "doctor" || role === "provider") return "/provider-dashboard";
  if (role === "admin") return "/my-medications";
  return "/my-medications";
}

// --- Main ---
async function main() {
  const baseUrl = resolveBaseUrl();
  const creds = resolveCredentials();
  const targetPage = resolveTargetPage(userPreset);

  if (!creds.email || !creds.password) {
    console.error("Missing credentials. Set TEST_USER_EMAIL/TEST_USER_PASSWORD (or TEST_DOCTOR_EMAIL/TEST_DOCTOR_PASSWORD) in .env.local, or pass --email and --password.");
    process.exit(1);
  }

  console.log(`\nLogging in to ${baseUrl}`);
  console.log(`  User:  ${creds.email} (${userPreset})`);
  console.log(`  Page:  ${targetPage}\n`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Sign in
  await page.goto(`${baseUrl}/sign-in`);
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByRole("button", { name: "Sign In" }).click();

  // Wait for redirect after login
  try {
    await page.waitForURL((url) => !url.pathname.includes("/sign-in"), {
      timeout: 15000,
    });
  } catch {
    console.error("Login failed — still on sign-in page after 15s. Check credentials.");
    await browser.close();
    process.exit(1);
  }

  // Navigate to target page
  if (!page.url().includes(targetPage)) {
    await page.goto(`${baseUrl}${targetPage}`);
  }

  await page.waitForLoadState("networkidle");
  console.log(`Logged in! Browser open at: ${page.url()}`);
  console.log("Press Ctrl+C to close the browser.\n");

  // Keep process alive until user closes
  await new Promise(() => {});
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
