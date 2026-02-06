import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL!;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!;

/**
 * Helper: sign in and navigate to dashboard.
 */
async function signInToDashboard(page: import("@playwright/test").Page, context: import("@playwright/test").BrowserContext) {
  await context.clearCookies();
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/my-medications", { timeout: 10000 });
}

test.describe("Camera & Voice Changes", () => {
  test("camera-latest API returns valid JSON when authenticated", async ({
    context,
    page,
  }) => {
    // Sign in to get an authenticated session
    await signInToDashboard(page, context);

    // Call the camera-latest API using the authenticated page context
    const response = await page.request.get("/api/voice/camera-latest");
    expect(response.status()).toBe(200);

    const body = await response.json();
    // Should have a description field (either real data or the fallback)
    expect(body).toHaveProperty("description");
    expect(typeof body.description).toBe("string");
    expect(body.description.length).toBeGreaterThan(0);
    // Should have imageUrl and capturedAt (may be null if no captures)
    expect(body).toHaveProperty("imageUrl");
    expect(body).toHaveProperty("capturedAt");
  });

  test("camera-latest API rejects unauthenticated requests", async ({
    context,
    page,
  }) => {
    await context.clearCookies();
    // Directly navigate — middleware will redirect to /sign-in
    const response = await page.request.get("/api/voice/camera-latest", {
      maxRedirects: 0,
    });
    // Middleware redirects unauthenticated requests (307) to /sign-in
    expect([307, 302, 401]).toContain(response.status());
  });

  test("dashboard voice assistant card is visible with Talk button", async ({
    context,
    page,
  }) => {
    await signInToDashboard(page, context);

    // Voice Assistant card should be visible
    await expect(page.getByText("Voice Assistant")).toBeVisible();

    // Talk to AdherePod button should be present
    await expect(
      page.getByRole("button", { name: "Talk to AdherePod" })
    ).toBeVisible();

    // Camera placeholder should show "Camera starts on call" before connecting
    await expect(page.getByText("Camera starts on call")).toBeVisible();
  });

  test("dashboard shows camera placeholder before call starts", async ({
    context,
    page,
  }) => {
    await signInToDashboard(page, context);

    // Before starting a call, should see the camera placeholder text
    await expect(page.getByText("Camera starts on call")).toBeVisible();

    // Should NOT see "Camera Live" before connecting
    await expect(page.getByText("Camera Live")).not.toBeVisible();
  });

  test("transcript area shows prompt to start conversation", async ({
    context,
    page,
  }) => {
    await signInToDashboard(page, context);

    // Should show the pre-call prompt
    await expect(
      page.getByText('Press "Talk to AdherePod" to start a voice conversation.')
    ).toBeVisible();
  });
});
