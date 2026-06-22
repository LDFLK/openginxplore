import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:5173', {
    waitUntil: 'domcontentloaded',
  });

  await expect(page).toHaveTitle(/.*/);
});