import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Mobile', width: 375, height: 812 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1280, height: 800 },
];

for (const viewport of VIEWPORTS) {
  test(`AKD full flow test - ${viewport.name} (${viewport.width}px)`, async ({ page, browserName }) => {

    // Set viewport size
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    // 1. Go to organization page
    await page.goto(
      'http://localhost:5173/organization?view=cabinet-structure&startDate=2021-06-22&endDate=2026-06-22&selectedDate=2026-04-21',
      { waitUntil: 'domcontentloaded', timeout: 30000 }
    );

    // 2. Wait for AKD card
    const akdCard = page.locator('button', {
      hasText: 'Anura Kumara Dissanayake',
    });
    await expect(akdCard).toBeVisible({ timeout: 20000 });

    // 3. Click View Profile
    await akdCard
      .locator('a', { hasText: 'View Profile' })
      .first()
      .click();

    await page.waitForLoadState('domcontentloaded');

    // 4. URL CHECK
    await expect(page).toHaveURL(/person-profile\/2403-03-01_cit_1/, { timeout: 15000 });

    // Screenshot after landing on profile
    await page.screenshot({ path: `test-results/profile-${viewport.name.toLowerCase()}-${browserName}.png` });

    // 5. Grant clipboard permissions (Chromium only)
    if (browserName === 'chromium') {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    }

    // 6. Click share button — use parent div to find it regardless of viewport
    const shareButton = page.locator('div.relative.z-50 button').first();
    await expect(shareButton).toBeVisible({ timeout: 15000 });
    await shareButton.click();

    // 7. Verify clipboard (Chromium only)
    if (browserName === 'chromium') {
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain('person-profile/2403-03-01_cit_1');
    }

    // 8. Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 9. Source link at bottom — just verify it exists and has correct href
    const sourceLink = page.locator('a[href="https://www.parliament.lk/"]');
    await expect(sourceLink).toBeVisible({ timeout: 10000 });

    // Open in new tab but don't wait for full load (external site is slow)
    const [newTab] = await Promise.all([
      page.context().waitForEvent('page'),
      sourceLink.click(),
    ]);
    // Just verify tab opened with correct URL, don't wait for full page load
    await newTab.waitForURL(/parliament\.lk/, { timeout: 15000 });
    expect(newTab.url()).toContain('parliament.lk');
    await newTab.close();

    // 10. Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // 11. Click Portfolios Held
    const portfoliosTab = page.locator('button', { hasText: 'Portfolios Held' });
    await expect(portfoliosTab).toBeVisible({ timeout: 10000 });
    await portfoliosTab.click();

    // 12. Verify it becomes active
    await expect(portfoliosTab).toHaveClass(/border-accent/, { timeout: 5000 });

    // Screenshot of portfolios tab
    await page.screenshot({ path: `test-results/portfolios-${viewport.name.toLowerCase()}-${browserName}.png` });

    // 13. Click Qualifications
    const qualificationsTab = page.locator('button', { hasText: 'Qualifications' });
    await expect(qualificationsTab).toBeVisible({ timeout: 10000 });
    await qualificationsTab.click();

    // 14. Verify it becomes active
    await expect(qualificationsTab).toHaveClass(/border-accent/, { timeout: 5000 });

    // Screenshot of qualifications tab
    await page.screenshot({ path: `test-results/qualifications-${viewport.name.toLowerCase()}-${browserName}.png` });

    // 15. Click Back button
    const backButton = page.locator('button', { hasText: 'Back' });
    await expect(backButton).toBeVisible({ timeout: 10000 });
    await backButton.click();

    // 16. Verify back on organization page
    await expect(page).toHaveURL(/organization/, { timeout: 15000 });

    // Final screenshot
    await page.screenshot({ path: `test-results/back-${viewport.name.toLowerCase()}-${browserName}.png` });

  });
}