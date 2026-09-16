import { expect, Page, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const emulatorDocuments = 'http://127.0.0.1:8080/v1/projects/demo-pinboard/databases/(default)/documents';

async function openPrivateBoard(page: Page): Promise<string> {
  // The test browser is new, so capture only its own anonymous sign-up response.
  const signUp = page.waitForResponse(response => response.url().includes('accounts:signUp') && response.status() === 200);
  await page.goto('/tasks');
  await ready(page);
  return (await (await signUp).json()).localId;
}

async function ready(page: Page) {
  await expect(page.getByText('Connected to local Firebase', { exact: true })).toBeVisible();
}
async function createTask(page: Page, title: string, category = 'Work', description = '') {
  await page.getByRole('link', { name: 'Add a task', exact: true }).click();
  await page.getByLabel("What's on your mind?").fill(title);
  await page.getByLabel('A few more details').fill(description);
  await page.getByLabel('Category', { exact: true }).selectOption(category);
  await page.getByRole('button', { name: 'Add to my board', exact: true }).click();
  await expect(page.getByRole('article', { name: title, exact: true })).toBeVisible();
}
async function status(page: Page, title: string, value: string) {
  const field = page.getByRole('combobox', { name: `Status: ${title}`, exact: true });
  await field.selectOption(value);
  await expect(field).toHaveValue(value);
}
async function dismiss(page: Page) {
  const button = page.getByRole('button', { name: 'Dismiss notification' });
  if (await button.isVisible()) await button.click();
}
async function accessible(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.failureSummary) }))).toEqual([]);
}

test('CRUD, all three statuses, category colors, sidebar links, filtering and persistence', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/tasks');
  await ready(page);
  await expect(page).toHaveTitle('Shipyard | My Board');
  await expect(page.getByRole('heading', { name: 'Task Board', exact: true })).toBeVisible();
  await expect(page.locator('progress')).toHaveCount(0);
  await expect(page.getByText('My workspace', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Add a task', exact: true }).click();
  await page.getByLabel("What's on your mind?").fill('   ');
  await page.getByRole('button', { name: 'Add to my board', exact: true }).click();
  await expect(page.getByText("Add a title with 1 to 100 characters. Spaces alone don't count.")).toBeVisible();
  await page.getByRole('link', { name: 'Cancel', exact: true }).click();
  await createTask(page, 'Draft the plan', 'Work', 'Make a first draft.');
  await createTask(page, 'Go for a walk', 'Personal', 'Bring a notebook.');
  await createTask(page, 'Learn signals', 'Learning');
  await expect(page.getByRole('article', { name: 'Draft the plan' })).toHaveClass(/note-butter/);
  await expect(page.getByRole('article', { name: 'Go for a walk' })).toHaveClass(/note-sky/);
  await expect(page.getByRole('article', { name: 'Learn signals' })).toHaveClass(/note-rose/);
  const sidebar = page.getByRole('navigation', { name: 'Active tasks' });
  await expect(sidebar.getByRole('link')).toHaveCount(3);
  await status(page, 'Draft the plan', 'Tracking');
  await status(page, 'Go for a walk', 'Shipped');
  await expect(sidebar.getByRole('link')).toHaveCount(2);
  await page.reload();
  await ready(page);
  await expect(page.getByRole('combobox', { name: 'Status: Draft the plan' })).toHaveValue('Tracking');
  await expect(page.getByRole('combobox', { name: 'Status: Go for a walk' })).toHaveValue('Shipped');
  await page.getByRole('button', { name: 'Personal', exact: true }).click();
  await expect(page.locator('.task-note')).toHaveCount(1);
  await sidebar.getByRole('link', { name: 'Go to task: Draft the plan' }).click();
  await expect(page.getByRole('dialog', { name: 'Draft the plan' })).toBeVisible();
  await page.getByRole('button', { name: 'Close task details' }).click();
  // Opening details preserves filters; sidebar links can still open a hidden note.
  await expect(page.locator('.task-note')).toHaveCount(1);
  await expect(sidebar.getByRole('link', { name: 'Go to task: Draft the plan' })).toBeFocused();
  await sidebar.getByRole('link', { name: 'Go to task: Draft the plan' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Edit task', exact: true }).click();
  await expect(page.getByLabel("What's on your mind?")).toHaveValue('Draft the plan');
  await expect(page.getByLabel('Status', { exact: true })).toHaveValue('Tracking');
  await page.getByLabel("What's on your mind?").fill('Ship the plan');
  await page.getByLabel('Category', { exact: true }).selectOption('Learning');
  await page.getByLabel('Priority', { exact: true }).selectOption('High');
  await page.getByLabel('A date to aim for').fill('2020-01-01');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Ship the plan' })).toHaveClass(/note-rose/);
  await expect(page.getByRole('article', { name: 'Go for a walk' })).toContainText('Bring a notebook.');
  await page.reload();
  await ready(page);
  await expect(page.getByRole('article', { name: 'Ship the plan' })).toContainText('Overdue:');
  await page.getByRole('searchbox', { name: 'Search tasks' }).fill('notebook');
  await expect(page.locator('.task-note')).toHaveCount(1);
  await page.getByRole('searchbox', { name: 'Search tasks' }).fill('nothing matches');
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByRole('button', { name: 'Learning', exact: true }).click();
  await expect(page.locator('.task-note')).toHaveCount(2);
  await page.getByRole('button', { name: 'Everything', exact: true }).click();
  await page.getByRole('combobox', { name: 'Sort tasks' }).selectOption('priority');
  await expect(page.getByRole('region', { name: 'Tracking column', exact: true }).locator('.task-note').first()).toHaveAttribute('aria-label', 'Ship the plan');
  await status(page, 'Go for a walk', 'Planning');
  await expect(sidebar.getByRole('link')).toHaveCount(3);
  await page.getByRole('button', { name: 'Delete Go for a walk', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Keep task' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.task-note')).toHaveCount(3);
  for (const title of ['Go for a walk', 'Ship the plan', 'Learn signals']) {
    await page.getByRole('button', { name: `Delete ${title}`, exact: true }).click();
    await page.getByRole('button', { name: 'Delete task', exact: true }).click();
    await expect(page.getByRole('article', { name: title, exact: true })).toHaveCount(0);
  }
  await page.reload();
  await ready(page);
  await expect(page.locator('.task-note')).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const theme of ['light', 'dark'] as const) {
  test(`${theme}: responsive sticky notes, form and dialog accessibility`, async ({ page }, info) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/tasks');
    await ready(page);
    await expect(page.getByRole('combobox', { name: 'Theme', exact: true })).toHaveValue(theme);
    await createTask(page, 'Sketch the next idea', 'Work', 'A few rough notes are a good place to start.');
    await createTask(page, 'A little time outside', 'Personal', 'Take the long way home.');
    await createTask(page, 'Get curious about signals', 'Learning', 'Try it out. Write down what clicks.');
    await createTask(page, 'Send the first draft', 'Work', 'Good enough to share is a good place to start.');
    await createTask(page, 'Plan a slow Sunday', 'Personal', 'Coffee, a book, and no rush.');
    await status(page, 'Sketch the next idea', 'Tracking');
    await status(page, 'Send the first draft', 'Shipped');
    await page.getByRole('combobox', { name: 'Sort tasks' }).selectOption('oldest');
    await dismiss(page);
    await page.screenshot({ path: info.outputPath('board-desktop.png'), fullPage: true });
    await accessible(page);
    await createTask(page, 'A'.repeat(100), 'Learning', 'unbroken-content'.repeat(100));
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: `Delete ${'A'.repeat(100)}`, exact: true }).click();
    await accessible(page);
    await page.getByRole('button', { name: 'Delete task', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Task Board', exact: true })).toBeFocused();
    await dismiss(page);
    await page.locator('.board-scroll').evaluate(element => { element.scrollLeft = 0; });
    await page.screenshot({ path: info.outputPath('board-mobile.png'), fullPage: true });
    await page.getByRole('link', { name: 'Add a task', exact: true }).click();
    await page.getByLabel("What's on your mind?").fill('Make a little time');
    await page.getByLabel('Category', { exact: true }).selectOption('Personal');
    await expect(page.locator('.preview-note')).toHaveClass(/note-sky/);
    await expect(page.getByRole('radio')).toHaveCount(0);
    await page.screenshot({ path: info.outputPath('form-mobile.png'), fullPage: true });
    await accessible(page);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

test('theme dropdown follows the system, persists explicit choices and synchronizes tabs', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/tasks');
  await ready(page);
  const theme = page.getByRole('combobox', { name: 'Theme', exact: true });
  await expect(theme).toHaveValue('dark');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(0, 0, 0)');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(theme).toHaveValue('light');
  await theme.selectOption('dark');
  await page.reload();
  await expect(theme).toHaveValue('dark');
  const tab = await page.context().newPage();
  await tab.goto('/tasks');
  await expect(tab.getByRole('combobox', { name: 'Theme', exact: true })).toHaveValue('dark');
  await theme.selectOption('light');
  await expect(tab.getByRole('combobox', { name: 'Theme', exact: true })).toHaveValue('light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(theme).toHaveValue('light');
  await page.getByRole('link', { name: 'Add a task', exact: true }).click();
  await expect(theme).toHaveValue('light');
  await tab.close();
});

test('connection retry preserves drafts and statuses synchronize between tabs', async ({ page }) => {
  await page.route('http://127.0.0.1:9099/**', route => route.abort());
  await page.goto('/tasks/new');
  await page.getByLabel("What's on your mind?").fill('Keep this draft');
  await expect(page.getByRole('alert')).toContainText('We could not open your private board');
  await page.unroute('http://127.0.0.1:9099/**');
  await page.getByRole('button', { name: 'Retry connection' }).click();
  await ready(page);
  await expect(page.getByLabel("What's on your mind?")).toHaveValue('Keep this draft');
  await page.getByRole('button', { name: 'Add to my board', exact: true }).click();
  await expect(page.locator('.task-note')).toHaveCount(1);
  const tab = await page.context().newPage();
  await tab.goto('/tasks');
  await ready(tab);
  await status(page, 'Keep this draft', 'Tracking');
  await expect(tab.getByRole('combobox', { name: 'Status: Keep this draft' })).toHaveValue('Tracking');
  await status(tab, 'Keep this draft', 'Shipped');
  await expect(page.getByRole('combobox', { name: 'Status: Keep this draft' })).toHaveValue('Shipped');
  await tab.close();
});

test('unknown routes, missing tasks, and separate browser privacy', async ({ page, browser }) => {
  await page.goto('/tasks');
  await ready(page);
  await createTask(page, 'Private to this browser');
  const context = await browser.newContext();
  const other = await context.newPage();
  await other.goto(new URL('/tasks', page.url()).href);
  await ready(other);
  await expect(other.locator('.task-note')).toHaveCount(0);
  await context.close();
  await page.goto('/tasks/missing/edit');
  await ready(page);
  await expect(page.getByRole('heading', { name: 'This note is no longer here.' })).toBeVisible();
  await page.goto('/missing');
  await expect(page.getByRole('heading', { name: 'This page wandered off.' })).toBeVisible();
});

test('legacy completed tasks adapt to Shipped and category colors, then save the new schema', async ({ page, request }) => {
  const userId = await openPrivateBoard(page);
  await createTask(page, 'Legacy compatibility fixture', 'Personal');
  const editUrl = await page.getByRole('link', { name: 'Edit Legacy compatibility fixture' }).getAttribute('href');
  const id = editUrl!.split('/')[2];
  // Simulate the previous format only on this test user's own document.
  const documentUrl = `${emulatorDocuments}/users/${userId}/tasks/${id}`;
  const patched = await request.patch(documentUrl + '?updateMask.fieldPaths=status&updateMask.fieldPaths=completed&updateMask.fieldPaths=color', {
    headers: { Authorization: 'Bearer owner' }, data: { fields: { completed: { booleanValue: true }, color: { stringValue: 'sage' } } },
  });
  expect(patched.ok()).toBe(true);
  await page.reload();
  await ready(page);
  await expect(page.getByRole('combobox', { name: 'Status: Legacy compatibility fixture' })).toHaveValue('Shipped');
  await expect(page.locator('.task-note')).toHaveClass(/note-sky/);
  await status(page, 'Legacy compatibility fixture', 'Planning');
  const stored = await request.get(documentUrl, { headers: { Authorization: 'Bearer owner' } });
  const fields = (await stored.json()).fields;
  expect(fields.status.stringValue).toBe('Planning');
  expect(fields.completed.booleanValue).toBe(false);
  expect(fields.color.stringValue).toBe('sky');
});

test('ten notes match Firestore, isolated edits, first and middle deletion', async ({ page, request }) => {
  // Psudo code //
  // First create a fresh private board through the real app.
  // Then compare the displayed notes with that user's Firestore documents.
  // Edit one record and delete selected records through the UI.
  // Finally reload and verify that the database and board still agree.
  const userId = await openPrivateBoard(page);
  const collectionUrl = `${emulatorDocuments}/users/${userId}/tasks`;
  const readDocument = async (id: string) => {
    const response = await request.get(`${collectionUrl}/${id}`, { headers: { Authorization: 'Bearer owner' } });
    expect(response.ok()).toBe(true);
    return response.json();
  };
  const ids: string[] = [];
  await expect(page.getByRole('heading', { name: 'No tasks yet.', exact: true })).toBeVisible();
  for (let index = 0; index < 10; index++) {
    const title = `Checklist task ${index + 1}`;
    await createTask(page, title, ['Work', 'Personal', 'Learning'][index % 3], `Details for task ${index + 1}`);
    const href = await page.getByRole('link', { name: `Edit ${title}`, exact: true }).getAttribute('href');
    ids.push(href!.split('/')[2]);
    const stored = await readDocument(ids[index]);
    expect(stored.fields.title.stringValue).toBe(title);
    expect(stored.fields.description.stringValue).toBe(`Details for task ${index + 1}`);
    expect(stored.fields.completed.booleanValue).toBe(false);
  }
  const list = await request.get(collectionUrl, { headers: { Authorization: 'Bearer owner' } });
  expect(list.ok()).toBe(true);
  const documents = (await list.json()).documents;
  expect(documents).toHaveLength(10);
  await page.reload();
  await ready(page);
  const renderedIds = await page.locator('.task-note').evaluateAll(notes => notes.map(note => note.id.replace('task-', '')).sort());
  expect(renderedIds).toEqual(ids.toSorted());
  for (const width of [1440, 768, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const beforeA = await readDocument(ids[0]);
  const beforeB = await readDocument(ids[1]);
  // Opening A and B in sequence must show each task's own values.
  for (const index of [0, 1, 0]) {
    await page.getByRole('link', { name: `Edit Checklist task ${index + 1}`, exact: true }).click();
    await expect(page.getByLabel("What's on your mind?")).toHaveValue(`Checklist task ${index + 1}`);
    await expect(page.getByLabel('A few more details')).toHaveValue(`Details for task ${index + 1}`);
    await expect(page.getByLabel('Status', { exact: true })).toHaveValue('Planning');
    await page.getByRole('link', { name: 'Cancel', exact: true }).click();
  }
  await page.getByRole('link', { name: 'Edit Checklist task 1', exact: true }).click();
  await page.getByLabel("What's on your mind?").fill('Updated checklist task');
  await page.getByLabel('A few more details').fill('Updated details');
  await page.getByLabel('Status', { exact: true }).selectOption('Shipped');
  await page.getByLabel('Category', { exact: true }).selectOption('Learning');
  await page.getByLabel('Priority', { exact: true }).selectOption('High');
  await page.getByLabel('A date to aim for').fill('2026-09-17');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Updated checklist task', exact: true })).toBeVisible();
  const afterA = await readDocument(ids[0]);
  expect(afterA.name).toBe(beforeA.name);
  expect(afterA.fields).toEqual({
    ...beforeA.fields,
    title: { stringValue: 'Updated checklist task' },
    description: { stringValue: 'Updated details' },
    status: { stringValue: 'Shipped' }, completed: { booleanValue: true },
    category: { stringValue: 'Learning' }, color: { stringValue: 'rose' },
    priority: { stringValue: 'High' }, dueDate: { stringValue: '2026-09-17' },
  });
  expect(await readDocument(ids[1])).toEqual(beforeB);
  await page.reload();
  await ready(page);
  await expect(page.getByRole('article', { name: 'Updated checklist task', exact: true })).toContainText('Updated details');
  await page.getByRole('combobox', { name: 'Sort tasks' }).selectOption('oldest');
  const removed: string[] = [];
  for (const position of [0, 4]) {
    const note = page.locator('.task-note').nth(position);
    const id = (await note.getAttribute('id'))!.replace('task-', '');
    removed.push(id);
    await note.getByRole('button', { name: /^Delete / }).click();
    await page.getByRole('button', { name: 'Delete task', exact: true }).click();
    await expect(page.locator(`#task-${id}`)).toHaveCount(0);
    const deleted = await request.get(`${collectionUrl}/${id}`, { headers: { Authorization: 'Bearer owner' } });
    expect(deleted.status()).toBe(404);
  }
  await page.reload();
  await ready(page);
  const remaining = ids.filter(id => !removed.includes(id)).sort();
  expect(await page.locator('.task-note').evaluateAll(notes => notes.map(note => note.id.replace('task-', '')).sort())).toEqual(remaining);
  const storedRemaining = await request.get(collectionUrl, { headers: { Authorization: 'Bearer owner' } });
  expect((await storedRemaining.json()).documents.map((item: { name: string }) => item.name.split('/').pop()).sort()).toEqual(remaining);
});


async function dragNote(page: Page, title: string, destination: string) {
  const handle = page.getByRole('article', { name: title, exact: true }).locator('.note-content');
  await handle.scrollIntoViewIfNeeded();
  const source = (await handle.boundingBox())!;
  const target = page.locator('#column-' + destination);
  const box = (await target.boundingBox())!;
  const start = { x: source.x + source.width / 2, y: source.y + 25 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 10, start.y + 10, { steps: 3 });
  await page.mouse.move(box.x + box.width / 2, box.y + 70, { steps: 20 });
  await expect(target).toHaveClass(/cdk-drop-list-dragging/);
  await page.mouse.up();
}

test('dragging changes column and Firestore status, preserves color, and syncs with editing', async ({ page, request }) => {
  const userId = await openPrivateBoard(page);
  await createTask(page, 'Move this note', 'Personal', 'Keep my details and color.');
  await createTask(page, 'Leave this note', 'Work');
  const href = await page.getByRole('link', { name: 'Edit Move this note', exact: true }).getAttribute('href');
  const id = href!.split('/')[2];
  const documentUrl = `${emulatorDocuments}/users/${userId}/tasks/${id}`;
  const assertStored = async (status: string) => {
    const response = await request.get(documentUrl, { headers: { Authorization: 'Bearer owner' } });
    expect(response.ok()).toBe(true);
    const fields = (await response.json()).fields;
    expect(fields.status.stringValue).toBe(status);
    expect(fields.completed.booleanValue).toBe(status === 'Shipped');
    expect(fields.color.stringValue).toBe('sky');
    expect(fields.description.stringValue).toBe('Keep my details and color.');
  };
  const noteIn = (status: string, target = page) => target.getByRole('region', { name: `${status} column`, exact: true }).getByRole('article', { name: 'Move this note', exact: true });
  await expect(page.locator('.status-column')).toHaveCount(3);
  await expect(noteIn('Planning')).toBeVisible();
  const other = await page.context().newPage();
  await other.goto(new URL('/tasks', page.url()).href);
  await ready(other);
  await dragNote(page, 'Move this note', 'Tracking');
  await expect(noteIn('Tracking')).toBeVisible();
  await expect(noteIn('Tracking', other)).toBeVisible();
  await expect(noteIn('Planning')).toHaveCount(0);
  await assertStored('Tracking');
  await dragNote(page, 'Move this note', 'Shipped');
  await expect(noteIn('Shipped')).toHaveClass(/note-sky/);
  await expect(page.getByRole('navigation', { name: 'Active tasks' }).getByRole('link', { name: 'Go to task: Move this note' })).toHaveCount(0);
  await assertStored('Shipped');
  // Dropping back in the same column is a no-op, so it must not rewrite the document.
  const before = await (await request.get(documentUrl, { headers: { Authorization: 'Bearer owner' } })).json();
  await dragNote(page, 'Move this note', 'Shipped');
  expect(await (await request.get(documentUrl, { headers: { Authorization: 'Bearer owner' } })).json()).toEqual(before);
  await page.reload();
  await ready(page);
  await expect(noteIn('Shipped')).toBeVisible();
  // Category filtering keeps all three drop targets available.
  await page.getByRole('button', { name: 'Personal', exact: true }).click();
  await dragNote(page, 'Move this note', 'Planning');
  await expect(noteIn('Planning')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Filter by status', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Personal', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await assertStored('Planning');
  // Edit remains a keyboard-accessible way to move the same note.
  await page.getByRole('link', { name: 'Edit Move this note', exact: true }).click();
  await page.getByLabel('Status', { exact: true }).selectOption('Tracking');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(noteIn('Tracking')).toBeVisible();
  await assertStored('Tracking');
  await expect(page.getByRole('region', { name: 'Planning column', exact: true }).getByRole('article', { name: 'Leave this note', exact: true })).toBeVisible();
  await other.close();
});

test('touch dragging scrolls narrow columns and saves the destination status', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(baseURL + '/tasks');
  await ready(page);
  await createTask(page, 'Touch move', 'Learning');
  const handle = page.getByRole('article', { name: 'Touch move', exact: true }).locator('.note-content');
  await handle.scrollIntoViewIfNeeded();
  const box = (await handle.boundingBox())!;
  const session = await context.newCDPSession(page);
  const touch = async (type: 'touchStart' | 'touchMove' | 'touchEnd', x = 0, y = 0) => {
    await session.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  };
  const x = box.x + box.width / 2;
  const y = box.y + 25;
  await touch('touchStart', x, y);
  // Hold beyond the intentional touch delay so normal swipes remain available for scrolling.
  await page.waitForTimeout(220);
  await touch('touchMove', x + 30, y + 25);
  await expect(page.locator('.cdk-drag-preview')).toHaveCount(1);
  const scroll = page.locator('.board-scroll');
  const scrollBox = (await scroll.boundingBox())!;
  await touch('touchMove', scrollBox.x + scrollBox.width - 3, y + 10);
  await expect.poll(() => scroll.evaluate(element => element.scrollLeft)).toBeGreaterThan(180);
  const destination = (await page.locator('#column-Tracking').boundingBox())!;
  await touch('touchMove', Math.min(350, destination.x + destination.width / 2), y + 10);
  await expect(page.locator('#column-Tracking')).toHaveClass(/cdk-drop-list-dragging/);
  await touch('touchEnd');
  await expect(page.getByRole('region', { name: 'Tracking column', exact: true }).getByRole('article', { name: 'Touch move', exact: true })).toBeVisible();
  await page.reload();
  await ready(page);
  await expect(page.getByRole('region', { name: 'Tracking column', exact: true }).getByRole('article', { name: 'Touch move', exact: true })).toHaveClass(/note-rose/);
  await context.close();
});

test('a rejected drop keeps the note in its source column and allows a retry', async ({ page, request }) => {
  const userId = await openPrivateBoard(page);
  await createTask(page, 'Retry this move');
  const href = await page.getByRole('link', { name: 'Edit Retry this move', exact: true }).getAttribute('href');
  const documentUrl = `${emulatorDocuments}/users/${userId}/tasks/${href!.split('/')[2]}`;
  // Add an invalid extra field only to this test record. Real Firestore rules will reject its update.
  const invalid = await request.patch(documentUrl + '?updateMask.fieldPaths=unexpectedField', {
    headers: { Authorization: 'Bearer owner' }, data: { fields: { unexpectedField: { booleanValue: true } } },
  });
  expect(invalid.ok()).toBe(true);
  await dragNote(page, 'Retry this move', 'Tracking');
  await expect(page.getByRole('alert')).toContainText('This task could not be updated.');
  await expect(page.getByRole('region', { name: 'Planning column', exact: true }).getByRole('article', { name: 'Retry this move' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Status: Retry this move' })).toBeEnabled();
  const beforeRetry = await request.get(documentUrl, { headers: { Authorization: 'Bearer owner' } });
  expect((await beforeRetry.json()).fields.status.stringValue).toBe('Planning');
  // Remove the extra field, then retry using the same visible note.
  const repaired = await request.patch(documentUrl + '?updateMask.fieldPaths=unexpectedField', {
    headers: { Authorization: 'Bearer owner' }, data: { fields: {} },
  });
  expect(repaired.ok()).toBe(true);
  await dragNote(page, 'Retry this move', 'Tracking');
  await expect(page.getByRole('region', { name: 'Tracking column', exact: true }).getByRole('article', { name: 'Retry this move' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

for (const theme of ['light', 'dark'] as const) {
  test(`${theme}: expanded notes, sidebar counts, keyboard access and live updates`, async ({ page, request }, info) => {
    await page.emulateMedia({ colorScheme: theme });
    const uid = await openPrivateBoard(page);
    const active = page.getByRole('navigation', { name: 'Active tasks', exact: true });
    const completed = page.getByRole('navigation', { name: 'Completed tasks', exact: true });
    await expect(active.getByRole('heading')).toHaveText('Active tasks 0');
    await expect(completed.getByRole('heading')).toHaveText('Completed tasks 0');
    await createTask(page, 'Explore the coast', 'Personal', 'Bring a notebook.\nTake the scenic path.');
    await createTask(page, 'Finish the sketch', 'Learning');
    await status(page, 'Finish the sketch', 'Shipped');
    await expect(active.getByRole('heading')).toHaveText('Active tasks 1');
    await expect(completed.getByRole('heading')).toHaveText('Completed tasks 1');
    await dismiss(page);
    const note = page.getByRole('article', { name: 'Explore the coast', exact: true });
    const noteId = (await note.getAttribute('id'))!.replace('task-', '');
    await note.getByRole('heading').dblclick();
    const detail = page.getByRole('dialog', { name: 'Explore the coast', exact: true });
    await expect(detail).toHaveClass('note-sky');
    await expect(detail.locator('.description')).toHaveText('Bring a notebook.\nTake the scenic path.');
    await expect(detail.getByRole('button', { name: 'Close task details' })).toBeFocused();
    await accessible(page);
    await page.screenshot({ path: info.outputPath('task-detail-desktop.png'), fullPage: true });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(note).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(detail).toBeVisible();
    await page.getByRole('button', { name: 'Close task details' }).click();
    await completed.getByRole('link', { name: 'Go to task: Finish the sketch' }).click();
    await expect(page.getByRole('dialog')).toContainText('Shipped');
    await page.getByRole('dialog').getByRole('link', { name: 'Edit task', exact: true }).click();
    await page.getByLabel('Status', { exact: true }).selectOption('Tracking');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(active.getByRole('heading')).toHaveText('Active tasks 2');
    await expect(completed.getByRole('heading')).toHaveText('Completed tasks 0');
    await active.getByRole('link', { name: 'Go to task: Explore the coast' }).click();
    // Simulate a second client changing this test user's note while details are open.
    const url = `${emulatorDocuments}/users/${uid}/tasks/${noteId}`;
    const update = await request.patch(url + '?updateMask.fieldPaths=description&updateMask.fieldPaths=status&updateMask.fieldPaths=completed', {
      headers: { Authorization: 'Bearer owner' },
      data: { fields: { description: { stringValue: 'unbroken-content'.repeat(100) }, status: { stringValue: 'Shipped' }, completed: { booleanValue: true } } },
    });
    expect(update.ok()).toBe(true);
    await expect(detail.locator('.description')).toHaveText('unbroken-content'.repeat(100));
    await expect(detail).toContainText('Shipped');
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await detail.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await accessible(page);
    await page.screenshot({ path: info.outputPath('task-detail-mobile.png'), fullPage: true });
    await page.reload();
    await expect(detail).toBeVisible();
    expect((await request.delete(url, { headers: { Authorization: 'Bearer owner' } })).ok()).toBe(true);
    await expect(page.getByRole('dialog', { name: 'Task unavailable' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(active.getByRole('heading')).toHaveText('Active tasks 1');
    await expect(completed.getByRole('heading')).toHaveText('Completed tasks 0');
    await expect(page.getByRole('heading', { name: 'Task Board', exact: true })).toBeVisible();
  });
}

test('Help opens a concise guide, fits both themes and returns to the board', async ({ page }, info) => {
  await page.goto('/tasks');
  await ready(page);
  for (const theme of ['light', 'dark']) {
    await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme);
    await page.getByRole('button', { name: 'Help', exact: true }).click();
    const help = page.getByRole('dialog', { name: 'Using Shipyard' });
    await expect(help).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close help', exact: true })).toBeFocused();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await help.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await accessible(page);
    await page.screenshot({ path: info.outputPath(`help-${theme}-mobile.png`), fullPage: true });
    await page.getByRole('button', { name: 'Back to board', exact: true }).click();
    await expect(help).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Help', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Help', exact: true }).click();
    await expect(help).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close help', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(help).toHaveCount(0);
  }
  await page.getByRole('link', { name: 'Add a task', exact: true }).click();
  await page.getByRole('button', { name: 'Help', exact: true }).click();
  await page.getByRole('button', { name: 'Close help', exact: true }).click();
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole('heading', { name: 'Task Board', exact: true })).toBeVisible();
});
