import { test, expect } from "@playwright/test";

const TEST_EMAIL = "aifurman@gmail.com";
const TEST_PASSWORD = "1700ManorRd!";

test.describe("Auth flow", () => {
  test("homepage has Sign In button and hero image", async ({ page }) => {
    await page.goto("/");
    const signInButton = page.getByRole("link", { name: "Sign In" }).first();
    await expect(signInButton).toBeVisible();
    await expect(
      page.getByAltText("Elderly woman talking to AdherePod at her kitchen table")
    ).toBeVisible();
  });

  test("sign-in page loads", async ({ context, page }) => {
    await context.clearCookies();
    await page.goto("/sign-in");
    await expect(page.getByText("Sign In").first()).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("sign-in with valid credentials redirects to dashboard", async ({
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto("/sign-in");

    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("My Medications")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Talk to AdherePod" })
    ).toBeVisible();
  });

  test("sign-in with wrong password shows error", async ({
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto("/sign-in");

    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("sign-out returns to homepage", async ({ context, page }) => {
    await context.clearCookies();
    // Sign in first
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Open avatar dropdown then sign out
    await page.locator("[data-slot='avatar']").click();
    await page.getByRole("menuitem", { name: "Sign Out" }).click();
    await page.waitForURL("**/", { timeout: 10000 });
  });

  test("dashboard redirects to sign-in when not authenticated", async ({
    context,
    page,
  }) => {
    await context.clearCookies();
    await page.goto("/dashboard");
    await page.waitForURL("**/sign-in", { timeout: 10000 });
  });
});
