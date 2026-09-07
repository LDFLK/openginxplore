// @ts-nocheck
import { test, expect, PERSON_ID } from './fixtures';

// Viewport per browser/viewport combination is configured via the project's
// `use.viewport` in playwright.config.js rather than looped over here, so each
// combination runs as its own Playwright project. Mocks are wired up automatically
// by the `mocks` auto fixture in ./fixtures.ts — no manual setupMocks(page) call needed.

test('Profile full flow', async ({ page, browserName }, testInfo) => {
  const projectName = testInfo.project.name;

  await page.goto(
    '/executive-branch?view=cabinet-structure&startDate=2021-06-22&endDate=2026-06-22&selectedDate=2026-04-21',
    { waitUntil: 'domcontentloaded', timeout: 30000 }
  );

  const profileCard = page.locator('button', { hasText: 'Test Person One' });
  await expect(profileCard).toBeVisible({ timeout: 20000 });

  await profileCard.locator('a', { hasText: 'View Profile' }).first().click({ timeout: 150000 });
  await page.waitForLoadState('domcontentloaded');

  await expect(page).toHaveURL(new RegExp(`person-profile/${PERSON_ID}`), { timeout: 15000 });
  await page.screenshot({ path: `test-results/profile-${projectName}.png` });

  await expect(page.getByText('Test Person One')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Test Party A/)).toBeVisible({ timeout: 10000 });

  if (browserName === 'chromium') {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  }
  const shareButton = page.locator('div.relative.z-50 button').first();
  await expect(shareButton).toBeVisible({ timeout: 15000 });
  await shareButton.click();

  if (browserName === 'chromium') {
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain(`person-profile/${PERSON_ID}`);
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  const sourceLink = page.locator('a[href="https://www.parliament.lk/"]');
  await expect(sourceLink).toBeVisible({ timeout: 10000 });

  const [newTab] = await Promise.all([
    page.context().waitForEvent('page'),
    sourceLink.click(),
  ]);
  await newTab.waitForURL(/parliament\.lk/, { timeout: 15000 });
  expect(newTab.url()).toContain('parliament.lk');
  await newTab.close();

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const portfoliosTab = page.locator('button', { hasText: 'Portfolios Held' });
  await expect(portfoliosTab).toBeVisible({ timeout: 10000 });
  await portfoliosTab.click();
  await expect(portfoliosTab).toHaveClass(/border-accent/, { timeout: 5000 });
  await page.screenshot({ path: `test-results/portfolios-${projectName}.png` });

  const qualificationsTab = page.locator('button', { hasText: 'Qualifications' });
  await expect(qualificationsTab).toBeVisible({ timeout: 10000 });
  if (projectName === 'firefox-mobile') {
    await qualificationsTab.dispatchEvent('click');
  } else {
    await qualificationsTab.click();
  }
  await expect(qualificationsTab).toHaveClass(/border-accent/, { timeout: 5000 });
  await page.screenshot({ path: `test-results/qualifications-${projectName}.png` });

  const backButton = page.locator('button', { hasText: 'Back' });
  await expect(backButton).toBeVisible({ timeout: 10000 });
  await backButton.click();
  await expect(page).toHaveURL(/executive-branch/, { timeout: 15000 });
  await page.screenshot({ path: `test-results/back-${projectName}.png` });
});

test('profile page - direct navigation with mocks', async ({ page }) => {
  await page.goto(`http://localhost:5173/person-profile/${PERSON_ID}`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  await expect(page.getByText('Test Person One')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Test Party A/)).toBeVisible({ timeout: 10000 });

  const portfoliosTab = page.locator('button', { hasText: 'Portfolios Held' });
  await expect(portfoliosTab).toBeVisible({ timeout: 10000 });
  await portfoliosTab.click();
  await expect(portfoliosTab).toHaveClass(/border-accent/, { timeout: 5000 });

  const qualificationsTab = page.locator('button', { hasText: 'Qualifications' });
  await expect(qualificationsTab).toBeVisible({ timeout: 10000 });
  await qualificationsTab.click();
  await expect(qualificationsTab).toHaveClass(/border-accent/, { timeout: 5000 });
});