import { test, expect } from "@playwright/test";

test("onboarding and all imported routes render without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByText("Is this you?")).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding\/wakil$/);
  await page.getByRole("button", { name: "Continue to limits" }).click();
  await expect(page).toHaveURL(/\/onboarding\/limits$/);
  await expect(page.getByText("Maximum · sealed")).toBeVisible();

  const paths = [
    "/requests/new", "/feed", "/negotiation/n-0142",
    "/notify", "/approve/SS-0142", "/approve/SS-0142/counter",
    "/deal/SS-0142/sealed?prep=seal", "/deal/SS-0142",
    "/deal/SS-0142/invoice", "/log", "/history/ayam-segar",
    "/no-deal/n-0139", "/listings",
    "/negotiation/n-0142?view=desktop", "/demo",
  ];
  for (const path of paths) {
    await page.goto(path);
    await expect(page.locator("body")).not.toContainText("Something went wrong");
    await expect(page.locator("body")).not.toContainText("Page not found");
    await expect(page.locator("body")).not.toContainText("Loading SupplySwipe");
    await expect(page.locator("#root")).not.toBeEmpty();
  }
  expect(errors).toEqual([]);
});

test("posting, negotiating and both owner approvals persist a sealed deal", async ({ page }) => {
  await page.goto("/onboarding/limits?prep=reset");
  await page.getByRole("button", { name: "Save limits" }).click();
  await expect(page).toHaveURL(/\/requests\/new$/);
  await page.getByRole("button", { name: "Post and see suppliers" }).click();
  await expect(page).toHaveURL(/\/feed$/);
  await page.getByRole("button", { name: "Send Wakil to negotiate" }).click();
  await page.getByRole("button", { name: "Watch live" }).click();
  await expect(page).toHaveURL(/\/negotiation\/n-0142$/);
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page).toHaveURL(/\/approve\/SS-0142$/);
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page.getByText(/Approved by.*waiting for/)).toBeVisible();
  await page.getByRole("button", { name: /Switch to.*view/ }).click();
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page).toHaveURL(/\/deal\/SS-0142\/sealed$/);
  await page.reload();
  await expect(page.getByText(/Deal sealed/i).first()).toBeVisible();
});
