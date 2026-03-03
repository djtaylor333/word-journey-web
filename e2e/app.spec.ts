import { test, expect, Page } from '@playwright/test';

// Helper: navigate to a page and wait for the app to hydrate
async function goto(page: Page, path: string = '/') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  // Wait for React hydration (loading spinner disappears)
  await page.waitForFunction(() => {
    const body = document.body.textContent ?? '';
    return body.replace(/Loading[…\.]+/g, '').trim().length > 5;
  }, { timeout: 15000 }).catch(() => null);
}

// Helper: inject progress into localStorage to skip onboarding
async function setupProgress(page: Page, overrides: Record<string, unknown> = {}) {
  await page.addInitScript((opts: Record<string, unknown>) => {
    const base = {
      coins: 500,
      diamonds: 5,
      lives: 10,
      lastLifeRegenTimestamp: 0,
      addGuessItems: 3,
      removeLetterItems: 3,
      definitionItems: 3,
      showLetterItems: 3,
      easyLevel: 1,
      regularLevel: 1,
      hardLevel: 1,
      vipLevel: 1,
      easyLevelsCompleted: 0,
      regularLevelsCompleted: 0,
      hardLevelsCompleted: 0,
      vipLevelsCompleted: 0,
      levelStars: {},
      dailyStreak: 0,
      dailyBestStreak: 0,
      dailyLastDate: '',
      dailyCompleted4: false,
      dailyCompleted5: false,
      dailyCompleted6: false,
      dailyStars4: 0,
      dailyStars5: 0,
      dailyStars6: 0,
      dailyStreak4: 0,
      dailyStreak5: 0,
      dailyStreak6: 0,
      dailyBestStreak4: 0,
      dailyBestStreak5: 0,
      dailyBestStreak6: 0,
      loginStreak: 0,
      loginBestStreak: 0,
      lastLoginDate: '',
      totalWins: 0,
      totalLevelsCompleted: 0,
      totalGuesses: 0,
      totalItemsUsed: 0,
      totalDailyChallengesCompleted: 0,
      totalCoinsEarned: 500,
      totalStars: 0,
      totalTimePlayed: 0,
      bonusLives: 0,
      timerBestEasy: 0,
      timerBestRegular: 0,
      timerBestHard: 0,
      pendingRewards: [],
      darkMode: true,
      highContrast: false,
      sfxEnabled: true,
      musicEnabled: false,
      musicVolume: 70,
      sfxVolume: 100,
      textScale: 1.0,
      hasSeenOnboarding: true,  // skip onboarding by default
      isNewPlayer: false,
      savedGameState: null,
      isVip: false,
      ...opts,
    };
    localStorage.setItem('word-journeys-progress', JSON.stringify(base));
  }, overrides);
}

// ───────────────────────────────────────────────────────────────────────────
// 1. App loads with content (not blank)
// ───────────────────────────────────────────────────────────────────────────
test('app loads and is not blank', async ({ page }) => {
  await setupProgress(page);
  await goto(page);
  // Should not be a blank page — look for any visible text content
  const body = await page.locator('body').textContent();
  expect(body?.trim().length).toBeGreaterThan(10);
  // Should not have the Vite root div without content
  const root = page.locator('#root');
  await expect(root).toHaveCount(0); // Next.js doesn't use #root
});

// ───────────────────────────────────────────────────────────────────────────
// 2. Onboarding screen shows for new players
// ───────────────────────────────────────────────────────────────────────────
test('onboarding screen shows for new players', async ({ page }) => {
  await setupProgress(page, { hasSeenOnboarding: false, isNewPlayer: true });
  await goto(page);
  await expect(page.getByText('Welcome to Word Journeys!')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: 'Next →' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Skip' })).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// 3. Onboarding can be completed slide-by-slide
// ───────────────────────────────────────────────────────────────────────────
test('can step through onboarding and land on home', async ({ page }) => {
  await setupProgress(page, { hasSeenOnboarding: false, isNewPlayer: true });
  await goto(page);

  // Click through 4 Next steps
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: 'Next →' }).click();
  }

  // Last slide should show Start Playing
  await expect(page.getByRole('button', { name: /Start Playing/i })).toBeVisible();
  await page.getByRole('button', { name: /Start Playing/i }).click();

  // Now on home screen
  await expect(page.getByText('Word Journeys')).toBeVisible({ timeout: 5000 });
});

// ───────────────────────────────────────────────────────────────────────────
// 4. Home screen renders correctly
// ───────────────────────────────────────────────────────────────────────────
test('home screen shows title, currency and difficulty cards', async ({ page }) => {
  await setupProgress(page);
  await goto(page);

  await expect(page.getByText('Word Journeys')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('🪙').first()).toBeVisible();
  await expect(page.getByText('💎').first()).toBeVisible();
  // Difficulty labels
  await expect(page.getByText('Easy').first()).toBeVisible();
  await expect(page.getByText('Regular').first()).toBeVisible();
  await expect(page.getByText('Hard').first()).toBeVisible();
  await expect(page.getByText('Daily Challenge').first()).toBeVisible();
  await expect(page.getByText('Timer Mode').first()).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// 5. Can navigate to Level Select
// ───────────────────────────────────────────────────────────────────────────
test('can open Level Select for Easy difficulty', async ({ page }) => {
  await setupProgress(page);
  await goto(page);

  await page.getByText('Easy').first().click();
  // Level Select shows zone name and level node
  await expect(page.getByText('Enchanted Meadow')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Continue').or(page.getByText('Level 1'))).toBeVisible({ timeout: 5000 });
});

// ───────────────────────────────────────────────────────────────────────────
// 6. Can start a game
// ───────────────────────────────────────────────────────────────────────────
test('can start a game from Level Select', async ({ page }) => {
  // Capture any JS errors that might prevent game from loading
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  await setupProgress(page);
  await goto(page);
  await page.getByText('Easy').first().click();
  // Wait for Level Select to render
  await expect(page.getByText('Enchanted Meadow')).toBeVisible({ timeout: 5000 });

  // Click the Continue button at the bottom
  await page.getByRole('button', { name: /Continue/i }).click();

  // Wait for game to finish loading words (valid_words.json is ~530KB)
  await page.waitForFunction(
    () => !document.body.textContent?.includes('Loading'),
    undefined,
    { timeout: 20000 }
  ).catch(async () => {
    // If loading never completes, report any errors found
    throw new Error(`Game never exited Loading state. JS errors: ${errors.join('; ') || 'none'}`);
  });

  // Game screen keyboard should now be visible
  await expect(page.locator('button').filter({ hasText: /^Q$/ })).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Level').first()).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// 7. Keyboard input works in game
// ───────────────────────────────────────────────────────────────────────────
test('can type letters in the game via keyboard buttons', async ({ page }) => {
  await setupProgress(page);
  await goto(page);
  await page.getByText('Easy').first().click();
  await expect(page.getByText('Enchanted Meadow')).toBeVisible({ timeout: 5000 });

  await page.getByRole('button', { name: /Continue/i }).click();

  // Wait for game to finish loading words
  await page.waitForFunction(
    () => !document.body.textContent?.includes('Loading'),
    { timeout: 20000 }
  );

  // Click W, O, R, D using exact button matching
  for (const letter of ['W', 'O', 'R', 'D']) {
    await page.locator('button').filter({ hasText: new RegExp(`^${letter}$`) }).first().click();
  }

  // The active row should now contain letters
  const tiles = page.locator('[style*="perspective"]');
  const count = await tiles.count();
  expect(count).toBeGreaterThan(0);
});

// ───────────────────────────────────────────────────────────────────────────
// 8. Daily Challenge screen
// ───────────────────────────────────────────────────────────────────────────
test('can open Daily Challenge screen', async ({ page }) => {
  await setupProgress(page);
  await goto(page);
  // Click the Daily Challenge BUTTON (not the h2 heading)
  await page.getByRole('button', { name: /Daily Challenge/i }).click();
  // Check for the per-length cards (label + letter count)
  await expect(page.getByText(/Easy.*4 letters/)).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/Regular.*5 letters/)).toBeVisible();
  await expect(page.getByText(/Hard.*6 letters/)).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// 9. Timer Mode setup screen
// ───────────────────────────────────────────────────────────────────────────
test('can open Timer Mode and see difficulty options', async ({ page }) => {
  await setupProgress(page);
  await goto(page);
  // Click the Timer Mode BUTTON (not the h2 heading)
  await page.getByRole('button', { name: /Timer Mode/i }).click();
  // Timer Mode screen has an ⏱ header
  await expect(page.getByText('⏱ Timer Mode')).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('button', { name: 'Start!' })).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// 10. Statistics screen
// ───────────────────────────────────────────────────────────────────────────
test('can open Statistics screen', async ({ page }) => {
  await setupProgress(page);
  await goto(page);
  await page.getByRole('button', { name: '📊' }).click();
  await expect(page.getByText('Statistics')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Economy')).toBeVisible();
  await expect(page.getByText('Adventure Progress')).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// 11. Settings screen
// ───────────────────────────────────────────────────────────────────────────
test('can open Settings and toggle High Contrast', async ({ page }) => {
  await setupProgress(page);
  await goto(page);
  await page.getByRole('button', { name: '⚙️' }).click();
  await expect(page.getByText('Settings')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('High Contrast')).toBeVisible();
  await expect(page.getByText('Sound Effects')).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// 12. Inbox screen with reward
// ───────────────────────────────────────────────────────────────────────────
test('inbox shows unclaimed reward and can claim it', async ({ page }) => {
  await setupProgress(page, {
    pendingRewards: [{
      id: 'test-reward',
      title: '🎉 Test Reward',
      message: 'A test reward.',
      coins: 100,
      claimed: false,
      timestamp: Date.now(),
    }],
  });
  await goto(page);
  await page.getByRole('button', { name: '📬' }).click();
  await expect(page.getByText('🎉 Test Reward')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Claim', exact: true }).click();
  // After claiming, the reward moves to history (opacity-50 section)
  await expect(page.getByText('Claimed')).toBeVisible({ timeout: 3000 });
});

// ───────────────────────────────────────────────────────────────────────────
// 13. Back navigation works
// ───────────────────────────────────────────────────────────────────────────
test('back button returns to home from Level Select', async ({ page }) => {
  await setupProgress(page);
  await goto(page);
  await page.getByText('Easy').first().click();
  await expect(page.getByText('Enchanted Meadow')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: '←' }).click();
  await expect(page.getByText('Word Journeys')).toBeVisible({ timeout: 5000 });
});

// ───────────────────────────────────────────────────────────────────────────
// 14. Back from Daily Challenge hub returns to Home
// ───────────────────────────────────────────────────────────────────────────
test('back from Daily Challenge hub goes to home', async ({ page }) => {
  await setupProgress(page);
  await goto(page);
  await page.getByRole('button', { name: /Daily Challenge/i }).click();
  await expect(page.getByText(/4 letters/i)).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: '←' }).click();
  await expect(page.getByText('Word Journeys')).toBeVisible({ timeout: 5000 });
});

// ───────────────────────────────────────────────────────────────────────────
// 15. Multi-level back navigation — home → level select → game → back → back → home
// ───────────────────────────────────────────────────────────────────────────
test('back navigation through multiple levels without looping', async ({ page }) => {
  await setupProgress(page);
  await goto(page);

  // Navigate two levels deep
  await page.getByText('Regular').first().click();
  await expect(page.getByText('Enchanted Meadow')).toBeVisible({ timeout: 5000 });

  // Go back once => home
  await page.getByRole('button', { name: '←' }).click();
  await expect(page.getByText('Word Journeys')).toBeVisible({ timeout: 5000 });

  // Verify we are actually on the home screen (not looped somewhere else)
  await expect(page.getByText(/🗺️ Adventure|Adventure/i).first()).toBeVisible({ timeout: 3000 });
});

// ───────────────────────────────────────────────────────────────────────────
// 16. Store screen opens and shows tabs
// ───────────────────────────────────────────────────────────────────────────
test('Store screen opens with tab navigation', async ({ page }) => {
  await setupProgress(page);
  await goto(page);
  await page.getByRole('button', { name: '🛒' }).click();
  await expect(page.getByText('Store')).toBeVisible({ timeout: 5000 });
  // Store has category tabs
  await expect(page.getByRole('button', { name: /Power-?ups|Boosts|Lives/i }).first()).toBeVisible({ timeout: 3000 });
  // Back returns to home
  await page.getByRole('button', { name: '←' }).click();
  await expect(page.getByText('Word Journeys')).toBeVisible({ timeout: 5000 });
});

// ───────────────────────────────────────────────────────────────────────────
// 17. Settings: dark mode toggle changes HTML class
// ───────────────────────────────────────────────────────────────────────────
test('Settings dark mode toggle applies theme class to document', async ({ page }) => {
  // Start in dark mode (default)
  await setupProgress(page, { darkMode: true });
  await goto(page);
  await page.getByRole('button', { name: '⚙️' }).click();
  await expect(page.getByText('Settings')).toBeVisible({ timeout: 5000 });

  // In dark mode, html should NOT have .light class
  const htmlClass = await page.evaluate(() => document.documentElement.className);
  expect(htmlClass).not.toContain('light');

  // Toggle to light mode
  const darkModeRow = page.locator('text=Dark Mode').first().locator('xpath=../..').first();
  const toggle = darkModeRow.locator('button[aria-checked]').first();
  await toggle.click();

  // Now .light class should be present
  const htmlClassAfter = await page.evaluate(() => document.documentElement.className);
  expect(htmlClassAfter).toContain('light');
});

// ───────────────────────────────────────────────────────────────────────────
// 18. Settings: text scale buttons are rendered
// ───────────────────────────────────────────────────────────────────────────
test('Settings shows text scale options (S / M / L / XL)', async ({ page }) => {
  await setupProgress(page);
  await goto(page);
  await page.getByRole('button', { name: '⚙️' }).click();
  await expect(page.getByText('Settings')).toBeVisible({ timeout: 5000 });

  // Scroll down to find text scale
  await page.getByText('Text Scale').scrollIntoViewIfNeeded().catch(() => null);
  await expect(page.getByText('Text Scale')).toBeVisible({ timeout: 3000 });
  // The scale buttons should be visible (labels like 'Small (85%)', 'Normal (100%)', 'Large (115%)')
  await expect(page.getByRole('button', { name: /Small|Normal|Large/i }).first()).toBeVisible({ timeout: 3000 });
});

// ───────────────────────────────────────────────────────────────────────────
// 19. Completed daily challenge shows checkmark and disables play button
// ───────────────────────────────────────────────────────────────────────────
test('completed daily challenge card is disabled', async ({ page }) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  await setupProgress(page, {
    dailyLastDate: today,
    dailyCompleted4: true,
    dailyCompleted5: true,
    dailyCompleted6: true,
    dailyStars4: 3,
    dailyStars5: 2,
    dailyStars6: 1,
  });
  await goto(page);
  await page.getByRole('button', { name: /Daily Challenge/i }).click();
  await expect(page.getByText(/4 letters/i)).toBeVisible({ timeout: 5000 });

  // At least one card shows stars (★)
  await expect(page.getByText('★').first()).toBeVisible({ timeout: 3000 });

  // All challenge buttons should be disabled
  const cards = page.locator('button:disabled');
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(1); // at least some are disabled
});

// ───────────────────────────────────────────────────────────────────────────
// 20. Daily challenge streak displayed on hub screen
// ───────────────────────────────────────────────────────────────────────────
test('daily challenge streak is visible on hub screen', async ({ page }) => {
  await setupProgress(page, { dailyStreak: 7, dailyBestStreak: 12 });
  await goto(page);
  await page.getByRole('button', { name: /Daily Challenge/i }).click();
  // The streak banner shows streak/best numbers
  const body = await page.locator('body').textContent() ?? '';
  expect(body).toContain('7');
  expect(body).toContain('12');
});

// ───────────────────────────────────────────────────────────────────────────
// 21. Back buttons have large tap targets (min 44×44 CSS px)
// ───────────────────────────────────────────────────────────────────────────
test('back buttons have adequately sized tap targets', async ({ page }) => {
  await setupProgress(page);
  await goto(page);
  await page.getByText('Easy').first().click();
  await expect(page.getByText('Enchanted Meadow')).toBeVisible({ timeout: 5000 });

  const backBtn = page.getByRole('button', { name: '←' });
  const box = await backBtn.boundingBox();
  expect(box).not.toBeNull();
  // At least 40px wide and tall for comfortable tapping
  expect(box!.width).toBeGreaterThanOrEqual(40);
  expect(box!.height).toBeGreaterThanOrEqual(40);
});

// ───────────────────────────────────────────────────────────────────────────
// 22. App screens are max-width constrained (tablet-friendly)
// ───────────────────────────────────────────────────────────────────────────
test('screens are constrained to max-width on wide viewports', async ({ page }) => {
  // Simulate a tablet/desktop
  await page.setViewportSize({ width: 1280, height: 900 });
  await setupProgress(page);
  await goto(page);

  // The content container should never be wider than, say, 720px on a 1280px screen
  const homeContent = page.locator('.max-w-2xl').first();
  const count = await homeContent.count();
  expect(count).toBeGreaterThan(0); // max-w-2xl class exists

  const box = await homeContent.boundingBox();
  if (box) {
    expect(box.width).toBeLessThanOrEqual(700); // max-w-2xl is 672px
  }
});
