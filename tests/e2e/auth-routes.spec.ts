import { test, expect } from '@playwright/test';

// Ensures /auth/complete forwards to /complete and preserves query params
// and verifies the /api/profile endpoint requires authentication.

test('auth completion redirects and profile requires auth', async ({ page, request }) => {
  // Hit the legacy path and ensure we land on /complete
  const url = '/auth/complete?mode=sign-in';
  const response = await page.goto(url);
  expect(response?.ok()).toBeTruthy();
  expect(page.url()).toContain('/complete?mode=sign-in');

  // Unauthenticated API request should be 401
  const api = await request.get('/api/profile');
  expect(api.status()).toBe(401);
});
