import { test, expect, type Page } from '@playwright/test';

/**
 * End-to-end coverage of the simulated /voice flow.
 *
 * These tests assume the backend (http://localhost:8000) and frontend
 * (http://localhost:3000) are already running. See tests/README.md.
 * No audio is uploaded: the "recording" is a UI simulation that loads a
 * scripted, synthetic Telugu transcript from the scenario API.
 */

async function openVoice(page: Page) {
  await page.goto('/voice');
  await expect(page.getByRole('heading', { name: 'GramVaani Voice Assistant' })).toBeVisible();
  // The scenario list is fetched from the backend on mount.
  await expect(page.locator('#scenario-select')).toBeEnabled();
}

async function selectAndRecord(page: Page, scenarioId: string): Promise<string> {
  await page.locator('#scenario-select').selectOption(scenarioId);

  await page.getByRole('button', { name: 'Start simulated recording' }).click();
  await expect(page.getByRole('button', { name: 'Stop simulated recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Stop simulated recording' }).click();

  const transcript = page.locator('#transcript');
  await expect(transcript).toBeVisible();
  await expect(transcript).not.toHaveValue('');
  return (await transcript.inputValue()) ?? '';
}

async function extractFields(page: Page) {
  await page.getByRole('button', { name: /Extract fields from transcript|Re-run extraction/ }).click();
  await expect(page.locator('.extraction').first()).toBeVisible();
}

async function confirmReport(page: Page) {
  await page.getByRole('button', { name: 'Confirm and generate report' }).click();
  await expect(page.getByText('Validation passed')).toBeVisible();
}

async function submitToGateway(page: Page) {
  await page.getByRole('button', { name: 'Submit to gateway' }).click();
}

test('golden path: scripted record, edit, extract, confirm, submit, see accepted result', async ({ page }) => {
  await openVoice(page);
  await selectAndRecord(page, 's01-normal-telugu');

  // The transcript is editable and may be corrected before extraction.
  const editor = page.locator('#transcript');
  const original = await editor.inputValue();
  await editor.fill(`${original} సింథటిక్ సవరణ.`);
  await expect(editor).toHaveValue(`${original} సింథటిక్ సవరణ.`);

  await extractFields(page);
  await expect(page.locator('.extraction').first()).toBeVisible();
  await confirmReport(page);
  await submitToGateway(page);

  await expect(page.locator('.badge').filter({ hasText: /^accepted$/ })).toBeVisible();
  await expect(page.getByText('Receipt id')).toBeVisible();
});

test('correction: worker fixes a wrongly extracted meal count before confirmation', async ({ page }) => {
  await openVoice(page);
  await selectAndRecord(page, 's07-extraction-error-meal-count');
  await extractFields(page);

  const mealRow = page.locator('.extraction').filter({
    has: page.locator('code.small', { hasText: /^meal_count$/ }),
  });
  await expect(mealRow).toBeVisible();
  await mealRow.locator('input').fill('22');

  await confirmReport(page);

  const reportedMeals = page.locator('.data-table tr').filter({
    has: page.locator('code', { hasText: /^meal_count$/ }),
  }).locator('td').nth(1);
  await expect(reportedMeals).toHaveText('22');

  await submitToGateway(page);
  await expect(page.locator('.badge').filter({ hasText: /^accepted$/ })).toBeVisible();
});

test('network failure: first gateway attempt fails, retry with same key succeeds', async ({ page }) => {
  await openVoice(page);
  await selectAndRecord(page, 's08-network-failure-retry');
  await extractFields(page);
  await confirmReport(page);

  // First submit returns HTTP 503 from the simulated gateway.
  await submitToGateway(page);
  await expect(page.getByText(/Submission failed/)).toBeVisible();

  // Retrying with the same idempotency key is accepted exactly once.
  await page.getByRole('button', { name: 'Retry with same idempotency key' }).click();
  await expect(page.locator('.badge').filter({ hasText: /^accepted$/ })).toBeVisible();
});
