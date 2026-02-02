import { test, expect } from '@playwright/test';

test('dashboard is dark and in French', async ({ page }) => {
  // We need to bypass the login to see the dashboard, or just check the colors if we can.
  // Since middleware redirects to /login if not authenticated, we might just see /login.
  // But I want to see if the global CSS is applied.
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'dashboard_check.png', fullPage: true });
});
