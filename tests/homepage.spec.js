import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/', {
    waitUntil: 'domcontentloaded',
  });

  await expect(page).toHaveTitle(/.*/);
});