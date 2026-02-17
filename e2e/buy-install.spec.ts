import { test, expect } from "@playwright/test";

test.describe("Buy / Install flow", () => {
  test("catalog lists packs with Certified badge and View pack / Install", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.getByText("Catalog")).toBeVisible();
    await expect(page.getByText(/Certified v[\d.]+/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "View pack" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Install" }).first()).toBeVisible();
  });

  test("free pack: Install tab shows install options (no Sign in / Purchase)", async ({ page }) => {
    await page.goto("/packs/design-systems");
    await page.getByRole("tab", { name: "Install" }).click();
    const panel = page.locator("#panel-install");
    await expect(panel).toBeVisible();
    await expect(panel.getByText("Claude Skills")).toBeVisible();
    await expect(panel.getByText("OpenClaw")).toBeVisible();
    await expect(panel.getByRole("link", { name: "Sign in" })).not.toBeVisible();
    await expect(panel.getByRole("button", { name: "Purchase" })).not.toBeVisible();
  });

  test("free pack: Install tab shows install instructions or ZIP not published", async ({ page }) => {
    await page.goto("/packs/design-systems");
    await page.getByRole("tab", { name: "Install" }).click();
    const panel = page.locator("#panel-install");
    await expect(panel).toBeVisible();
    const hasDownload = await panel.getByRole("link", { name: "Download ZIP" }).isVisible().catch(() => false);
    const hasNotPublished = await panel.getByText("ZIP not yet published").isVisible().catch(() => false);
    expect(hasDownload || hasNotPublished).toBe(true);
  });

  test("install API: GET /api/packs/[slug]/install for free pack returns 200 and install payload", async ({
    request,
  }) => {
    const res = await request.get("/api/packs/design-systems/install");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("packSlug", "design-systems");
    expect(data).toHaveProperty("installInstructions");
    expect(data.installInstructions).toHaveProperty("claude_skills");
    expect(data.installInstructions).toHaveProperty("openclaw");
    expect(Array.isArray(data.installInstructions.claude_skills)).toBe(true);
  });

  test("pack page: Install tab has panel and machine-readable hint", async ({ page }) => {
    await page.goto("/packs/agent-evaluation-regression-harness");
    await page.getByRole("tab", { name: "Install" }).click();
    await expect(page.locator("#panel-install")).toBeVisible();
    await expect(page.locator("#panel-install").getByText(/\.claude\/skills|skillPaths|openclaw/)).toBeVisible();
  });
});
