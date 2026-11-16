import { test, expect, type Page } from '@playwright/test';

/**
 * Backup recording of the successful five-beat demo (DEMO_3MIN.md).
 * No audio is captured; the microphone is a UI timer that loads a scripted transcript.
 */

async function openVoice(page: Page) {
  await page.goto('/voice');
  await expect(page.getByRole('heading', { name: 'GramVaani Voice Assistant' })).toBeVisible();
  await expect(page.locator('#scenario-select')).toBeEnabled();
}

async function recordScenario(page: Page, id: string) {
  await page.locator('#scenario-select').selectOption(id);
  await page.getByRole('button', { name: 'Start simulated recording' }).click();
  await expect(page.getByRole('button', { name: 'Stop simulated recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Stop simulated recording' }).click();
  await expect(page.locator('#transcript')).not.toHaveValue('');
}

async function extractAndConfirm(page: Page) {
  await page.getByRole('button', { name: /Extract fields from transcript|Re-run extraction/ }).click();
  await expect(page.locator('.extraction').first()).toBeVisible();
  await page.getByRole('button', { name: 'Confirm and generate report' }).click();
  await expect(page.getByText('Validation passed')).toBeVisible();
}

test('backup recording: normal, correction, failure, retry, dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/SIMULATED ENVIRONMENT/).first()).toBeVisible();
  await page.waitForTimeout(800);

  // Beat 1 — clean Telugu scenario.
  await openVoice(page);
  await recordScenario(page, 's01-normal-telugu');
  await page.waitForTimeout(800);
  await extractAndConfirm(page);
  await page.getByRole('button', { name: 'Submit to gateway' }).click();
  await expect(page.locator('.badge').filter({ hasText: /^accepted$/ })).toBeVisible();
  await page.waitForTimeout(1000);

  // Beat 2 — wrong extraction, corrected before confirmation.
  await page.goto('/voice'); // reload resets the page state between beats
  await recordScenario(page, 's07-extraction-error-meal-count');
  await page.getByRole('button', { name: /Extract fields from transcript|Re-run extraction/ }).click();
  const mealRow = page.locator('.extraction').filter({
    has: page.locator('code.small', { hasText: /^meal_count$/ }),
  });
  await mealRow.locator('input').fill('22');
  await page.getByRole('button', { name: 'Confirm and generate report' }).click();
  await expect(page.getByText('Validation passed')).toBeVisible();
  await page.waitForTimeout(1000);

  // Beat 3 — simulated gateway failure.
  await page.goto('/voice'); // reload resets the page state between beats
  await recordScenario(page, 's08-network-failure-retry');
  await extractAndConfirm(page);
  await page.getByRole('button', { name: 'Submit to gateway' }).click();
  await expect(page.getByText(/Submission failed/)).toBeVisible();
  await page.waitForTimeout(1000);

  // Beat 4 — retry with same key, then show the dashboard.
  await page.getByRole('button', { name: 'Retry with same idempotency key' }).click();
  await expect(page.locator('.badge').filter({ hasText: /^accepted$/ })).toBeVisible();
  await page.waitForTimeout(800);
  await page.goto('/dashboard');
  await expect(page.getByText(/Simulated receiving application/)).toBeVisible();
  await page.waitForTimeout(1200);

  // Final frame — simulation banner.
  await page.goto('/');
  await expect(page.getByText(/SIMULATED ENVIRONMENT/).first()).toBeVisible();
  await page.waitForTimeout(1000);
});
