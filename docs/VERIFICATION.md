# Verification report

Verified September 12, 2026 on macOS arm64 with Node 24.19.0, Java 21, Chromium 153, Angular 20.3.31, AngularFire 20.0.1, and Firebase 11.10.0.

Latest update: expanded task details, live Active/Completed sidebar counts, and a concise Help guide are complete. All fourteen browser scenarios pass on development and optimized builds, and all six Firestore rule tests pass, including both themes, responsive dialogs, keyboard access, live changes/deletion, repeated sidebar opening, and preserved board filters.

Status-column release baseline: status columns and Angular CDK drag-and-drop are complete. All eleven browser scenarios passed on both the development app and optimized build, including mouse/touch moves, automatic horizontal scrolling, persisted statuses, and rejected-write recovery. All six rule tests passed. See [the assignment sanity check](ASSIGNMENT-CHECK.md) for the requirement mapping.

Footer follow-up: added the centered harbor message. Both light/dark responsive and accessibility scenarios and the optimized build passed again.

Note-header follow-up: removed the grip icon while retaining the Shipped checkmark. Mouse/touch drag tests, both responsive/accessibility scenarios, and the optimized build passed.

## Live deployment verification

Published September 12, 2026 at [Shipyard](https://shipyard-jacob-stieneker.web.app), with source at [GitHub](https://github.com/jacob-stieneker/shipyard-project). The owner-controlled Firebase project uses Spark without linked billing, anonymous Authentication, the default free-tier Firestore Native database in `nam5`, and Firebase Hosting. Owner-only rules and indexes were deployed before Hosting.

- The final `npm run build:cloud` passed with no warnings or errors, and Hosting deployment succeeded.
- In the public app, created a task, reloaded to confirm persistence, dragged Planning to Tracking, and reloaded its direct edit URL to verify the persisted status and SPA routing.
- Edited the title/category/status, confirmed the Learning note in Shipped and updated sidebar counts, and opened its expanded view from the sidebar.
- Opened and closed Help; switched Light/Dark; deleted the disposable test note and confirmed the empty board after reload. Restored Dark mode and left the app open with Connected to Firebase. The final browser console had no warnings or errors.
- Separate temporary Firebase users verified live owner create/read/update/delete, cross-user read/write rejection, unauthenticated read rejection, blank-title rejection, and server-side deletion readback. Test documents and temporary SDK accounts were removed.
- The first browser connection failed while newly enabled Authentication was becoming available; a fresh load connected successfully. An initial SDK permission-read test returned an offline error, so direct Firestore REST responses were used to confirm HTTP 403 for denied requests and HTTP 200 for the owner.

This cloud smoke check supplements the full emulator suite below. Local development and automated test defaults still use emulators; local notes were not migrated into the live project.

## Automated results

| Check | Result |
| --- | --- |
| Optimized Angular build | Passed, no build warnings/errors |
| Browser suite | 14 scenarios passed on development and optimized builds |
| Firestore security rules | 6 tests passed; test setup also supports repeated runs |
| Browser runtime errors during CRUD | None |
| Axe WCAG A/AA checks on board, form, delete dialog, task details, and Help | No detected violations in light or dark mode |
| Board layout at 320, 390, 768, 1024, 1440 px | No page overflow; only the status-column region scrolls horizontally when needed |
| Form layout at 320, 768, 1440 px | No horizontal overflow |
| Refresh persistence | Create, edit, and deletion remain after reload |
| Emulator restart persistence | Earlier export/import check preserved all 19 task IDs; current recovery imported the preserved Firestore export |
| Multi-tab updates | Tracking and Shipped status changes synchronize between tabs |
| Appearance preferences | Dropdown selection, system default, live system changes, reload persistence, and cross-tab sync passed |
| Dark background | Computed body background is true black (`rgb(0, 0, 0)`) |
| Cloud configuration guard | Correctly refuses unconfigured placeholders |
| Source conventions | No em dashes, emoji, legacy input/output decorators, structural directives, or AngularFire compat imports in application source |

The final initial bundle is approximately 701 kB raw, 189 kB estimated transfer. Board/form/not-found routes are lazy-loaded. The configured build budgets pass. The application uses only local system fonts and SVGs, so it does not require external font or image services. Board and form widths were checked in both themes.

## Functional coverage

- Blank and whitespace-only titles are rejected; normal form submissions create real documents.
- Ten tasks match direct Firestore readback and survive browser refresh.
- Opening Task A and B prefills their own values; editing multiple fields preserves the ID/timestamp and leaves Task B's database document unchanged.
- Planning/Tracking/Shipped columns, category filters, search, and sorting within each column work together.
- Dragging into empty or populated columns saves the destination status and preserves category colors. Refresh and other tabs reflect the change.
- A same-column drop does not rewrite the document. Rejected writes leave the note in its source column and allow a retry.
- Emulated touch dragging at 390 px triggers automatic horizontal scrolling and persists the move. Edit and note menus remain available for keyboard users.
- Category choices produce yellow Work, blue Personal, and pink Learning notes. Changing category updates the color.
- Both sidebar lists open expanded task details without clearing filters. Double-click and Enter also open notes; Close and Escape restore focus. Details stay live and handle tasks deleted by another client.
- Active tasks counts Planning/Tracking; Completed tasks counts Shipped. Status edits update both lists and counts.
- Help opens from the sidebar bottom and contains only brief user instructions. Close, Escape, and Back to board return to the board; both themes fit 320, 390, 768, and 1440 px.
- Legacy records without status display correctly after reload, and editing them saves the new status/color format.
- The title is Shipyard | My Board, the header is Task Board, and the optional progress meter is absent.
- An unmatched search has a clear-filters action.
- Delete cancellation via Escape preserves the task. First and middle task deletion removes the exact Firestore documents and survives refresh.
- The delete dialog initially focuses Keep task; successful deletion returns focus to the board heading.
- Separate anonymous browser users cannot see each other's boards.
- A failed Authentication connection shows an error and retry control. The user's draft remains intact, can be saved after retry, and synchronizes between tabs.
- Unknown routes and missing task IDs show useful recovery links.
- Owner CRUD succeeds. Unauthenticated/cross-user reads and writes fail. Invalid fields, blank titles, oversized strings, extra fields, and inconsistent status/completion, mismatched category/color, and forged timestamps are rejected by Firestore rules.

Screenshots captured from tasks created through the application:

- [Desktop board](screenshots/board-desktop.png)
- [Mobile board](screenshots/board-mobile.png)
- [Mobile task form](screenshots/form-mobile.png)
- [Dark desktop board](screenshots/board-dark-desktop.png)
- [Dark mobile board](screenshots/board-dark-mobile.png)
- [Dark mobile task form](screenshots/form-dark-mobile.png)
- [Expanded task, light](screenshots/task-detail-light.png)
- [Expanded task, dark](screenshots/task-detail-dark.png)
- [Help, light mobile](screenshots/help-light-mobile.png)
- [Help, dark mobile](screenshots/help-dark-mobile.png)

## Remaining limitations

- **Build selection:** `npm run build` deliberately targets emulators. For the hosted app, use `npm run build:cloud` immediately before deployment; both commands share an output directory. Spark usage quotas apply. No custom domain is configured.
- **Anonymous identity:** normal refreshes preserve access, but a new browser/device or clearing site data creates a different board. There is no sign-in/account-recovery feature. Emulators export on graceful exit, not after every keystroke; forced termination can lose changes since the last export.
- **Dependency advisories:** `npm audit fix` applied compatible changes, but the final audit still reports 11 inherited findings (9 moderate, 1 high, 1 critical), rooted in Firebase CLI dependencies such as tar, uuid, csv-parse, stream-json, qs, and OpenTelemetry. AngularFire 20 requires Firebase CLI 14 as a peer, so npm also includes that tooling in `--omit=dev` audits. The application imports AngularFire app/auth/firestore modules, not the Firebase CLI. Do not treat this as a clean dependency audit. Avoid untrusted archive/import inputs to the tooling and reassess the compatible AngularFire/Firebase CLI combination before production maintenance. The suggested force-fix downgrades Firebase CLI to 10.1.1 and violates AngularFire's peer requirement, so it was not applied. No unverified major overrides were introduced.
- **Test scope:** functional and automated accessibility testing used Chromium. Touch gestures used Chromium mobile emulation, not a physical device. Desktop and mobile screenshots were reviewed. Safari, Firefox, physical devices, and a full assistive-technology audit were not tested. Hosted verification covered the smoke checks above; the full automated suite remains emulator-based.
- **Scale:** each private board reads its task collection and filters/sorts in memory. This keeps the assignment understandable; pagination/search infrastructure would be a separate enhancement for large datasets.

## Reproduce

```bash
# Terminal one
npm run emulators
```

```bash
# Terminal two
npx playwright install chromium
npm test
npm run test:build
```

Browser reports are written to ignored `playwright-report/` and `test-results/`. Rule tests use a separate `demo-pinboard-rules` project inside the emulator and never reset the app database. Permission-denied messages for negative rule tests are expected.
