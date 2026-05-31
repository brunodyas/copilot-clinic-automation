import { expect, test } from '@playwright/test';

test.describe('public app flows', () => {
  test('home page renders starter heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'To get started, edit the page.tsx file.',
    );
  });

  test('login page displays form and signup link', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toHaveAttribute(
      'href',
      '/signup',
    );
  });

  test('signup redirects to login with pre-filled email', async ({ page }) => {
    await page.route('**/api/signup', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Account created successfully' }),
      });
    });

    await page.goto('/signup');
    await page.getByPlaceholder('Name').fill('QA User');
    await page.getByPlaceholder('Email').fill('qa@example.com');
    await page.getByPlaceholder('Password').fill('valid-password');

    await page.getByRole('button', { name: 'Create Account' }).click();

    await page.waitForURL('**/login?email=qa%40example.com');
    await expect(page.getByPlaceholder('Email')).toHaveValue('qa@example.com');
  });
});
