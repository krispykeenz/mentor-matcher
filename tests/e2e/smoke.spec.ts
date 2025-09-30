import { test, expect } from '@playwright/test';

test('landing page loads', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'MentorMatch SA' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
});
