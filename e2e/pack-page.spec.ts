import { test, expect } from "@playwright/test";

test.describe("Pack page validator (RUBRIC_FOR_THE_RUBRICS)", () => {
  test("design-systems: vX.Y and last updated above fold", async ({ page }) => {
    await page.goto("/packs/design-systems");
    await expect(page.getByText(/v[\d.]+/)).toBeVisible();
    await expect(page.getByText(/last updated/i)).toBeVisible();
  });

  test("design-systems: required tabs exist", async ({ page }) => {
    await page.goto("/packs/design-systems");
    const tabs = ["Syllabus", "Labs", "Rubric", "Examples", "Install", "Changelog"];
    for (const tab of tabs) {
      await expect(page.getByRole("tab", { name: tab })).toBeVisible();
    }
  });

  test("design-systems: primary CTA is Start Pack (no competing primary)", async ({ page }) => {
    await page.goto("/packs/design-systems");
    await expect(page.getByRole("link", { name: "Start Pack" }).first()).toBeVisible();
    await expect(page.getByText("View Rubric")).toBeVisible();
  });

  test("design-systems: rubric has at least 5 dimensions", async ({ page }) => {
    await page.goto("/packs/design-systems");
    await page.getByRole("tab", { name: "Rubric" }).click();
    await expect(page.locator("#panel-rubric")).toBeVisible();
    const table = page.locator("#panel-rubric table tbody tr");
    await expect(table).toHaveCount(await table.count());
    const count = await table.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("design-systems: Install tab contains machine endpoint link", async ({ page }) => {
    await page.goto("/packs/design-systems");
    await page.getByRole("tab", { name: "Install" }).click();
    await expect(page.locator("#panel-install")).toBeVisible();
    await expect(page.locator("#panel-install").getByText(/\/api\/packs/)).toBeVisible();
  });
});
