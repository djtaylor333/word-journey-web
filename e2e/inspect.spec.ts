/**
 * Inspection tests — run against the static export on port 3000.
 * Verifies new-user defaults, daily challenge header, audio toggles,
 * version display, dev-mode unlock, and corruption sanitization.
 *
 * Run with:
 *   npx playwright test e2e/inspect.spec.ts --reporter=list
 */
import { test, expect, Page } from '@playwright/test';

// ─── helpers ──────────────────────────────────────────────────────────────
async function gotoHome(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => (document.body.textContent ?? '').replace(/Loading[…\.]+/g, '').trim().length > 5,
    { timeout: 15000 }
  ).catch(() => null);
}

/** Clear localStorage and inject progress before navigation */
async function withProgress(page: Page, data: Record<string, unknown>) {
  await page.addInitScript((d: Record<string, unknown>) => {
    localStorage.clear();
    localStorage.setItem('word-journeys-progress', JSON.stringify(d));
  }, data);
}

const KNOWN_USER: Record<string, unknown> = {
  coins: 500, diamonds: 5, lives: 10,
  isNewPlayer: false, hasSeenOnboarding: true,
  addGuessItems: 3, removeLetterItems: 3,
  definitionItems: 3, showLetterItems: 3,
  easyLevel: 1, regularLevel: 1, hardLevel: 1, vipLevel: 1,
  pendingRewards: [], levelStars: {},
  sfxEnabled: true, musicEnabled: false, musicVolume: 70, sfxVolume: 100,
  darkMode: true, devModeEnabled: false, isVip: false,
  lastLifeRegenTimestamp: 0,
};

// ─── 1. NEW USER EXPERIENCE ───────────────────────────────────────────────
test.describe('New user experience', () => {
  test('fresh install shows onboarding screen', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await gotoHome(page);
    await page.screenshot({ path: 'test-results/inspect-01-onboarding.png', fullPage: true });
    await expect(page.getByText('Welcome to Word Journeys!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Next →' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Skip' })).toBeVisible();
  });

  test('new player coins are 500 after welcome bonus (skip onboarding)', async ({ page }) => {
    await withProgress(page, {
      coins: 100, diamonds: 5, lives: 10,
      isNewPlayer: true, hasSeenOnboarding: false,
      sfxEnabled: true, musicEnabled: false,
      darkMode: true, devModeEnabled: false, isVip: false,
      lastLifeRegenTimestamp: 0,
    });
    await gotoHome(page);
    // Skip onboarding
    await page.getByRole('button', { name: 'Skip' }).click().catch(() => null);
    await page.waitForFunction(
      () => !document.body.textContent?.includes('Welcome to Word Journeys'),
      { timeout: 8000 }
    ).catch(() => null);
    await page.screenshot({ path: 'test-results/inspect-02-new-user-home.png', fullPage: true });

    const body = await page.locator('body').textContent() ?? '';
    expect(body).toContain('500'); // coins after bonus
    expect(body).toContain('10');  // lives
  });

  test('currency emojis and values appear in home header', async ({ page }) => {
    await withProgress(page, KNOWN_USER);
    await gotoHome(page);
    await expect(page.getByText('Word Journeys').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/inspect-03-home-header.png', fullPage: true });

    await expect(page.getByText('🪙').first()).toBeVisible();
    await expect(page.getByText('💎').first()).toBeVisible();
    await expect(page.getByText('❤️').first()).toBeVisible();

    const body = await page.locator('body').textContent() ?? '';
    expect(body).toContain('500'); // coins
    expect(body).toContain('5');   // diamonds
    expect(body).toContain('10');  // lives
  });
});

// ─── 2. DAILY CHALLENGE ───────────────────────────────────────────────────
test.describe('Daily challenge', () => {
  test('daily challenge card visible on home screen', async ({ page }) => {
    await withProgress(page, KNOWN_USER);
    await gotoHome(page);
    await expect(page.getByText('Word Journeys').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Daily Challenge/i).first()).toBeVisible();
    await page.screenshot({ path: 'test-results/inspect-04-daily-card.png', fullPage: true });
  });

  test('daily challenge screen shows length cards, NOT "Level 9999"', async ({ page }) => {
    await withProgress(page, KNOWN_USER);
    await gotoHome(page);
    await page.getByRole('button', { name: /Daily Challenge/i }).click();
    await page.screenshot({ path: 'test-results/inspect-05-daily-screen.png', fullPage: true });

    const body = await page.locator('body').textContent() ?? '';
    expect(body).not.toContain('9999');

    await expect(page.getByText(/4 letters/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/5 letters/i).first()).toBeVisible();
    await expect(page.getByText(/6 letters/i).first()).toBeVisible();
  });

  test('entering a daily game shows "Daily Challenge" header, not "Level 9999"', async ({ page }) => {
    await withProgress(page, KNOWN_USER);
    await gotoHome(page);
    await page.getByRole('button', { name: /Daily Challenge/i }).click();
    await expect(page.getByText(/4 letters/i).first()).toBeVisible({ timeout: 5000 });

    // Start the 4-letter daily challenge
    const startBtn = page.getByRole('button').filter({ hasText: /Play|Start|4.?letter/i }).first();
    await startBtn.click();

    // Wait for game to load
    await page.waitForFunction(
      () => !document.body.textContent?.includes('Loading'),
      { timeout: 20000 }
    ).catch(() => null);

    await page.screenshot({ path: 'test-results/inspect-06-daily-game.png', fullPage: true });

    const body = await page.locator('body').textContent() ?? '';
    expect(body).not.toContain('9999');
    expect(body).toMatch(/Daily Challenge/i);
  });
});

// ─── 3. SETTINGS — AUDIO ─────────────────────────────────────────────────
test.describe('Settings — audio', () => {
  async function openSettings(page: Page, overrides: Record<string, unknown> = {}) {
    await withProgress(page, { ...KNOWN_USER, ...overrides });
    await gotoHome(page);
    await expect(page.getByText('Word Journeys').first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: '⚙️' }).click();
    await expect(page.getByText('Settings')).toBeVisible({ timeout: 5000 });
  }

  test('Settings screen has Sound Effects and Music sections', async ({ page }) => {
    await openSettings(page);
    await page.screenshot({ path: 'test-results/inspect-07-settings-audio.png', fullPage: true });
    await expect(page.getByText('Sound Effects').first()).toBeVisible();
    await expect(page.getByText('Music').first()).toBeVisible();
  });

  test('SFX toggle is ON by default (aria-checked=true)', async ({ page }) => {
    await openSettings(page, { sfxEnabled: true });

    const sfxRow = page.locator('text=Sound Effects').locator('xpath=../..').first();
    const toggle = sfxRow.locator('button[aria-checked]').first();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  test('Music toggle is OFF by default (aria-checked=false)', async ({ page }) => {
    await openSettings(page, { musicEnabled: false });

    const musicRow = page.locator('text=Music').first().locator('xpath=../..').first();
    const toggle = musicRow.locator('button[aria-checked]').first();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('Music toggle can be clicked without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await openSettings(page, { musicEnabled: false });

    const musicRow = page.locator('text=Music').first().locator('xpath=../..').first();
    const toggle = musicRow.locator('button[aria-checked]').first();
    await toggle.click();
    await page.screenshot({ path: 'test-results/inspect-08-music-toggled.png', fullPage: true });
    expect(errors).toHaveLength(0);
    // After click the toggle should be ON
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  });
});

// ─── 4. SETTINGS — VERSION & DEV MODE ────────────────────────────────────
test.describe('Settings — version and dev mode', () => {
  async function openSettings(page: Page, overrides: Record<string, unknown> = {}) {
    await withProgress(page, { ...KNOWN_USER, ...overrides });
    await gotoHome(page);
    await expect(page.getByText('Word Journeys').first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: '⚙️' }).click();
    await expect(page.getByText('Settings')).toBeVisible({ timeout: 5000 });
  }

  test('version shows 1.5.0', async ({ page }) => {
    await openSettings(page);
    await page.getByText('About').scrollIntoViewIfNeeded().catch(() => null);
    await page.screenshot({ path: 'test-results/inspect-09-version.png', fullPage: true });

    await expect(page.getByText('1.5.0')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Web Preview')).toHaveCount(0);
  });

  test('[DEV] badge visible when devModeEnabled=true', async ({ page }) => {
    await openSettings(page, { devModeEnabled: true });
    await page.screenshot({ path: 'test-results/inspect-10-dev-badge.png', fullPage: true });
    await expect(page.getByText('[DEV]')).toBeVisible({ timeout: 5000 });
  });

  test('tapping version row 7 times unlocks dev panel', async ({ page }) => {
    await openSettings(page, { devModeEnabled: false });
    const versionBtn = page.locator('button').filter({ hasText: /1\.4\.0/ }).first();
    await versionBtn.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'test-results/inspect-11-pre-dev-tap.png', fullPage: true });

    for (let i = 0; i < 7; i++) {
      await versionBtn.click();
      await page.waitForTimeout(120);
    }

    await page.screenshot({ path: 'test-results/inspect-12-post-dev-tap.png', fullPage: true });
    await expect(page.getByText(/Developer Mode/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/\+10,000 Coins/i)).toBeVisible();
    await expect(page.getByText(/Reset All Progress/i)).toBeVisible();
  });

  test('dev panel shows all 7 action buttons', async ({ page }) => {
    await openSettings(page, { devModeEnabled: true });
    await page.screenshot({ path: 'test-results/inspect-13-dev-panel.png', fullPage: true });

    await expect(page.getByRole('button', { name: /\+10,000 Coins/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /\+100 Diamonds/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /\+10 Lives/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /\+5 All Power-ups/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Toggle VIP/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reset All Progress/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Disable Dev Mode/i })).toBeVisible();
  });
});

// ─── 5. DEV PANEL ACTIONS ─────────────────────────────────────────────────
test.describe('Developer panel actions', () => {
  async function openDev(page: Page) {
    await withProgress(page, { ...KNOWN_USER, devModeEnabled: true });
    await gotoHome(page);
    await expect(page.getByText('Word Journeys').first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: '⚙️' }).click();
    await expect(page.getByText(/Developer Mode/i)).toBeVisible({ timeout: 5000 });
  }

  test('+10,000 Coins updates localStorage', async ({ page }) => {
    await openDev(page);
    await page.getByRole('button', { name: /\+10,000 Coins/i }).click();
    await page.screenshot({ path: 'test-results/inspect-14-dev-coins.png', fullPage: true });
    const coins = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('word-journeys-progress') ?? '{}').coins
    );
    expect(coins).toBeGreaterThanOrEqual(10500);
  });

  test('+100 Diamonds updates localStorage', async ({ page }) => {
    await openDev(page);
    await page.getByRole('button', { name: /\+100 Diamonds/i }).click();
    const diamonds = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('word-journeys-progress') ?? '{}').diamonds
    );
    expect(diamonds).toBeGreaterThanOrEqual(105);
  });

  test('+10 Lives updates localStorage', async ({ page }) => {
    await openDev(page);
    await page.getByRole('button', { name: /\+10 Lives/i }).click();
    const lives = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('word-journeys-progress') ?? '{}').lives
    );
    expect(lives).toBeGreaterThanOrEqual(20);
  });

  test('Toggle VIP flips isVip in localStorage', async ({ page }) => {
    await openDev(page);
    await page.getByRole('button', { name: /Toggle VIP/i }).click();
    const isVip = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('word-journeys-progress') ?? '{}').isVip
    );
    expect(isVip).toBe(true);
  });

  test('Disable Dev Mode removes panel from view', async ({ page }) => {
    await openDev(page);
    await page.getByRole('button', { name: /Disable Dev Mode/i }).click();
    await page.screenshot({ path: 'test-results/inspect-15-dev-disabled.png', fullPage: true });
    await expect(page.getByText(/Developer Mode/i)).toHaveCount(0);
    await expect(page.getByText('[DEV]')).toHaveCount(0);
  });
});

// ─── 6. CORRUPTION GUARD ──────────────────────────────────────────────────
test.describe('Corruption sanitization', () => {
  test('lives 79517 capped to ≤999 on load', async ({ page }) => {
    await withProgress(page, {
      ...KNOWN_USER,
      lives: 79_517,
      coins: 7_952_570,
    });
    await gotoHome(page);
    await expect(page.getByText('Word Journeys').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/inspect-16-corrupt-sanitized.png', fullPage: true });

    const body = await page.locator('body').textContent() ?? '';
    expect(body).not.toContain('79517');
    expect(body).not.toContain('79,517');
    // Verify localStorage has been sanitized (lives capped at 999, coins at 9,999,999)
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('word-journeys-progress') ?? '{}')
    );
    expect(stored.lives).toBeLessThanOrEqual(999);
    expect(stored.coins).toBeLessThanOrEqual(9_999_999);
  });
});
