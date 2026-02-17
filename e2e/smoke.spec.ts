import { test, expect } from "@playwright/test";

test.describe("Smoke: routes render, no 500s", () => {
  test("home", async ({ page }) => {
    const r = await page.goto("/");
    expect(r?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("catalog", async ({ page }) => {
    const r = await page.goto("/catalog");
    expect(r?.status()).toBe(200);
    await expect(page.getByText("Catalog")).toBeVisible();
  });

  test("pack page design-systems", async ({ page }) => {
    const r = await page.goto("/packs/design-systems");
    expect(r?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Design System/i })).toBeVisible();
  });

  test("docs index", async ({ page }) => {
    const r = await page.goto("/docs");
    expect(r?.status()).toBe(200);
    await expect(page.getByText("Docs")).toBeVisible();
  });

  test("docs getting-started", async ({ page }) => {
    const r = await page.goto("/docs/getting-started");
    expect(r?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Getting Started" })).toBeVisible();
  });

  test("certification", async ({ page }) => {
    const r = await page.goto("/certification");
    expect(r?.status()).toBe(200);
    await expect(page.getByText("Certification")).toBeVisible();
  });
});
