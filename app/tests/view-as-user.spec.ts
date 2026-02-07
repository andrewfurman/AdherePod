import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL!;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!;

async function signInAsAdmin(context: import("@playwright/test").BrowserContext, page: import("@playwright/test").Page) {
  await context.clearCookies();
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/my-medications", { timeout: 10000 });
}

test.describe("View as User (admin impersonation)", () => {
  test("admin can view as another user from Users tab", async ({ context, page }) => {
    await signInAsAdmin(context, page);

    // Open avatar dropdown and navigate to Users tab
    await page.locator("[data-slot='avatar']").click();
    await page.getByRole("menuitem", { name: "Users" }).click();

    // Wait for users table to load
    await expect(page.getByRole("table")).toBeVisible({ timeout: 10000 });

    // Find an Eye icon button (view-as) in the users table and click it
    const viewAsButtons = page.getByTitle("View as this user");
    const buttonCount = await viewAsButtons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Click the first Eye button
    await viewAsButtons.first().click();

    // Impersonation banner should be visible
    await expect(page.getByText("Viewing as:")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("(read-only)")).toBeVisible();

    // Exit button in banner should be visible
    const exitButton = page.getByRole("button", { name: "Exit" });
    await expect(exitButton).toBeVisible();

    // Add Medication button should NOT be visible (read-only mode)
    await expect(page.getByRole("button", { name: "Add Medication" })).not.toBeVisible();

    // Voice Assistant / Talk to AdherePod button should NOT be visible
    await expect(page.getByRole("button", { name: "Talk to AdherePod" })).not.toBeVisible();

    // Medications tab should still show
    await expect(page.getByRole("tab", { name: "My Medications" })).toBeVisible();

    // History tab should still show
    await expect(page.getByRole("tab", { name: "History" })).toBeVisible();

    // Click Exit to return to own dashboard
    await exitButton.click();

    // Banner should be gone
    await expect(page.getByText("Viewing as:")).not.toBeVisible({ timeout: 5000 });

    // Add Medication button should be back
    await expect(page.getByRole("button", { name: "Add Medication" })).toBeVisible({ timeout: 5000 });
  });

  test("impersonation shows target user medications in read-only mode", async ({ context, page }) => {
    await signInAsAdmin(context, page);

    // Open Users tab
    await page.locator("[data-slot='avatar']").click();
    await page.getByRole("menuitem", { name: "Users" }).click();
    await expect(page.getByRole("table")).toBeVisible({ timeout: 10000 });

    // Click View As on the first user
    await page.getByTitle("View as this user").first().click();

    // Wait for impersonation banner
    await expect(page.getByText("Viewing as:")).toBeVisible({ timeout: 10000 });

    // Wait for medications to load
    await page.waitForTimeout(2000);

    // The card title should show "'s Medications" (target user's name)
    await expect(page.locator("[data-slot='card-title']").filter({ hasText: "Medications" })).toBeVisible();
  });

  test("history tab works during impersonation", async ({ context, page }) => {
    await signInAsAdmin(context, page);

    // Open Users tab and view as first user
    await page.locator("[data-slot='avatar']").click();
    await page.getByRole("menuitem", { name: "Users" }).click();
    await expect(page.getByRole("table")).toBeVisible({ timeout: 10000 });
    await page.getByTitle("View as this user").first().click();

    // Wait for impersonation banner
    await expect(page.getByText("Viewing as:")).toBeVisible({ timeout: 10000 });

    // Switch to History tab
    await page.getByRole("tab", { name: "History" }).click();

    // Should show the history section (loading or content — no crash)
    await page.waitForTimeout(1000);

    // The impersonation banner should still be visible
    await expect(page.getByText("Viewing as:")).toBeVisible();
  });
});
