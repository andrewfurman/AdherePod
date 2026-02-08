import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("privacy page loads with key compliance content", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /privacy policy/i }).first()).toBeVisible();
    await expect(page.getByText("Terms of Service").first()).toBeVisible();
    // A2P 10DLC required language
    await expect(
      page.getByText(/do not share, sell, rent/i).first()
    ).toBeVisible();
    // SMS opt-in section
    await expect(page.getByText(/SMS/i).first()).toBeVisible();
    // Contact info
    await expect(page.getByText("203-470-9996").first()).toBeVisible();
  });

  test("security page loads with compliance roadmap", async ({ page }) => {
    await page.goto("/security");
    await expect(page.getByRole("heading", { name: /security/i }).first()).toBeVisible();
    await expect(page.getByText(/SOC 2/i).first()).toBeVisible();
    await expect(page.getByText(/HIPAA/i).first()).toBeVisible();
    await expect(page.getByText(/Vanta/i).first()).toBeVisible();
    // Security features
    await expect(page.getByText(/Encryption at Rest/i).first()).toBeVisible();
    await expect(page.getByText(/Encryption in Transit/i).first()).toBeVisible();
  });

  test("medicare-advantage page loads with Star Rating content", async ({ page }) => {
    await page.goto("/medicare-advantage");
    await expect(page.getByRole("heading", { name: /star ratings/i }).first()).toBeVisible();
    // Key stats
    await expect(page.getByText("50%").first()).toBeVisible();
    await expect(page.getByText("$300B").first()).toBeVisible();
    // The three measures
    await expect(page.getByText(/D08/i).first()).toBeVisible();
    await expect(page.getByText(/D09/i).first()).toBeVisible();
    await expect(page.getByText(/D10/i).first()).toBeVisible();
    await expect(page.getByText(/triple-weighted/i).first()).toBeVisible();
  });

  test("device page loads with product concept", async ({ page }) => {
    await page.goto("/device");
    await expect(page.getByRole("heading", { name: /adherepod device/i }).first()).toBeVisible();
    await expect(page.getByText(/coming soon/i).first()).toBeVisible();
    // Key features
    await expect(page.getByText(/always-on/i).first()).toBeVisible();
    await expect(page.getByText(/voice/i).first()).toBeVisible();
    // Who it's for
    await expect(page.getByText(/elderly/i).first()).toBeVisible();
  });

  test("investors page loads with pitch deck content", async ({ page }) => {
    await page.goto("/investors");
    await expect(page.getByText(/adherepod/i).first()).toBeVisible();
    // Problem stats
    await expect(page.getByText("$300B").first()).toBeVisible();
    await expect(page.getByText("100K+").first()).toBeVisible();
    // Market size
    await expect(page.getByText(/34M/i).first()).toBeVisible();
    // Team
    await expect(page.getByText("Gage Clifton").first()).toBeVisible();
    await expect(page.getByText("Andrew Furman").first()).toBeVisible();
  });

  test("logos page loads with 10 logo concepts", async ({ page }) => {
    await page.goto("/logos");
    await expect(page.getByRole("heading", { name: /logo concepts/i }).first()).toBeVisible();
    // Check for several specific logo names
    await expect(page.getByText(/heart \+ pill/i).first()).toBeVisible();
    await expect(page.getByText(/ap monogram/i).first()).toBeVisible();
    // Check for AP Waveform variations
    await expect(page.getByText(/pill \+ ap waveform v1/i).first()).toBeVisible();
    // Should have SVGs on the page (13 logos + nav/footer icons)
    const svgs = page.locator("svg");
    expect(await svgs.count()).toBeGreaterThanOrEqual(13);
  });
});
