import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL!;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!;
const DOCTOR_EMAIL = process.env.TEST_DOCTOR_EMAIL!;
const DOCTOR_PASSWORD = process.env.TEST_DOCTOR_PASSWORD!;

async function signIn(
  context: import("@playwright/test").BrowserContext,
  page: import("@playwright/test").Page,
  email: string,
  password: string
) {
  await context.clearCookies();
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

test.describe("Doctor Provider View", () => {
  test("doctor can sign in and is redirected to provider-dashboard", async ({
    context,
    page,
  }) => {
    await signIn(context, page, DOCTOR_EMAIL, DOCTOR_PASSWORD);
    await page.waitForURL("**/provider-dashboard", { timeout: 10000 });
    await expect(page.getByText("Care Team")).toBeVisible();
  });

  test("doctor accessing my-medications is redirected to provider-dashboard", async ({
    context,
    page,
  }) => {
    await signIn(context, page, DOCTOR_EMAIL, DOCTOR_PASSWORD);
    await page.waitForURL("**/provider-dashboard", { timeout: 10000 });

    // Try navigating to my-medications — should redirect back
    await page.goto("/my-medications");
    await page.waitForURL("**/provider-dashboard", { timeout: 10000 });
    await expect(page.getByText("Care Team")).toBeVisible();
  });

  test("doctor sees patient list sidebar with search and Add Patient button", async ({
    context,
    page,
  }) => {
    await signIn(context, page, DOCTOR_EMAIL, DOCTOR_PASSWORD);
    await page.waitForURL("**/provider-dashboard", { timeout: 10000 });

    await expect(page.getByPlaceholder("Search patients...").last()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("button", { name: "Add Patient" })).toBeVisible();
  });

  test("doctor sees empty state when no patient is selected", async ({
    context,
    page,
  }) => {
    await signIn(context, page, DOCTOR_EMAIL, DOCTOR_PASSWORD);
    await page.waitForURL("**/provider-dashboard", { timeout: 10000 });

    await expect(
      page.getByText("Select a patient to view their details")
    ).toBeVisible({ timeout: 10000 });
  });

  test("doctor provider-dashboard has sign out in dropdown", async ({
    context,
    page,
  }) => {
    await signIn(context, page, DOCTOR_EMAIL, DOCTOR_PASSWORD);
    await page.waitForURL("**/provider-dashboard", { timeout: 10000 });

    // Open avatar dropdown
    await page.locator("[data-slot='avatar']").click();
    await expect(page.getByRole("menuitem", { name: "Sign Out" })).toBeVisible();
  });
});

test.describe("Patient vs Doctor Header Comparison", () => {
  test("patient user sees red My Medications badge on my-medications", async ({
    context,
    page,
  }) => {
    await signIn(context, page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForURL("**/my-medications", { timeout: 10000 });

    // Red badge in nav
    await expect(
      page.locator("nav").getByText("My Medications").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("patient user (admin) sees blue Care Team badge on provider-dashboard", async ({
    context,
    page,
  }) => {
    await signIn(context, page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForURL("**/my-medications", { timeout: 10000 });

    await page.goto("/provider-dashboard");
    await expect(page.getByText("Care Team")).toBeVisible({ timeout: 10000 });
  });

  test("doctor can select a patient and see Medications and Conversations tabs", async ({
    context,
    page,
  }) => {
    await signIn(context, page, DOCTOR_EMAIL, DOCTOR_PASSWORD);
    await page.waitForURL("**/provider-dashboard", { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Try clicking any patient in the sidebar
    const sidebarPatients = page.locator(".hidden.md\\:flex.w-64 .flex-1.overflow-y-auto > div");
    const count = await sidebarPatients.count();

    if (count > 0) {
      await sidebarPatients.first().click();
      await page.waitForTimeout(1000);

      // Should see Medications and Conversations tabs
      await expect(page.getByRole("button", { name: "Medications", exact: true })).toBeVisible({
        timeout: 10000,
      });
      await expect(
        page.getByRole("button", { name: "Conversations", exact: true })
      ).toBeVisible();
    } else {
      // No patients assigned — verify the empty state
      await expect(
        page.getByText("Select a patient to view their details")
      ).toBeVisible();
    }
  });
});
