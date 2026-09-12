# Changelog

## Unreleased

- Published the source to the public `jacob-stieneker/shipyard-project` GitHub repository.
- Deployed the owner-controlled `shipyard-jacob-stieneker` Firebase project on Spark without billing: anonymous Authentication, private Firestore rules/indexes, and HTTPS Hosting.
- Added the public cloud configuration, live app link, and redeployment instructions while preserving emulator defaults.
- Added credential-free connection error-code diagnostics for troubleshooting.

- Removed the redundant grip icon from notes, preserving dragging and the Shipped checkmark.
- Added the centered footer quotation '"Good ideas deserve to leave the harbor." - Jacob Stieneker' in small, theme-aware muted text.
- Added expanded category-colored task views from sidebar links, note double-clicks, and Enter, with live updates and an Edit action.
- Added active/completed sidebar lists and live counts; Shipped tasks appear under Completed tasks.
- Preserved board filters while viewing details and restored keyboard focus on close.
- Added a concise Help guide at the bottom of the sidebar, with Close, Escape, and Back to board controls.
- Verified fourteen browser scenarios on development and optimized builds, six rule tests, both themes, and responsive/accessibility checks. Updated documentation and screenshots.

- Removed the redundant status filter row now that the board has status columns.
- Removed the drag-and-drop instruction text above the columns.
- Moved search beside Add a task and placed the divider directly beneath the header.
- Kept category filtering, sorting, and all three drag-and-drop targets.

## 1.3.0 - 2026-09-12

- Organized notes into vertical Planning, Tracking, and Shipped columns, preserving the current styling and category colors.
- Added Angular CDK 20.2.14 for mouse/touch dragging with automatic horizontal scrolling on small screens.
- Saved dropped statuses through the existing Firebase service, preserving completion consistency, refresh persistence, and cross-tab updates.
- Kept status menus and edit forms as keyboard-accessible alternatives; sorting remains within columns.
- Retained all drop targets during filtering, with status filters resetting after successful moves.
- Added browser coverage for drag/drop persistence, touch scrolling, same-column no-ops, and rejected-write recovery.
- Passed eleven browser scenarios on both development and optimized builds, plus six Firebase rule tests.

- Completed the assignment sanity check with a documented requirements/code-example mapping.
- Added direct Firestore checks for ten notes, isolated edits, and first/middle deletion.
- Fixed repeatability of rule tests by resetting only their separate test project.
- Added `npm run test:build` to check compiled files; eight browser scenarios pass on both builds and six rule tests pass repeatedly.

- Removed category-color and Firebase-save helper messages from the task form.
- Added a subtle theme-aware divider and balanced spacing between status and category filters.

## 1.2.1 - 2026-09-12

- Simplified notes to flat category-colored rectangles with plain typography; removed tape, folded corners, shadows, and hover movement.
- Replaced filled filter buttons and count badges with simple text and underlined selection states.
- Simplified sidebar navigation, empty states, task forms, previews, and delete-dialog styling.
- Removed the duplicate add-task tile while keeping the main Add a task button.
- Preserved the blue palette, yellow/blue/pink category colors, Light/Dark modes, and all task operations.
- Passed all seven browser scenarios, responsive/accessibility checks in both themes, and the optimized Angular build. Updated screenshots and documentation.

## 1.2.0 - 2026-09-12

- Simplified the Task Board header and sidebar, placed the slogan under the logo, and removed promotional blocks and the optional progress meter.
- Added active-task sidebar links that reveal and focus the selected note.
- Added Planning, Tracking, and Shipped statuses to notes, filters, and the edit/create form.
- Made category determine sticky-note color: Work yellow, Personal blue, Learning pink.
- Added paper-style notes with tape, folded corners, and handwritten titles while preserving the blue palette and true-black dark canvas.
- Replaced the theme switch with a Light/Dark dropdown and retained saved/system preferences.
- Updated the board tab title to "Shipyard | My Board".
- Adapted older saved tasks on read and updated Firestore rules to validate the new status/color relationships.
- Updated browser/rule coverage, beginner documentation, and screenshots.
- Passed seven browser scenarios, six Firestore rule tests, responsive/accessibility checks in both themes, and the optimized build.

## 1.1.0 - 2026-09-12

- Renamed the app to Shipyard with the slogan "Plan. Track. Ship." and a small SVG ship logo/favicon.
- Rebuilt the visual style with modern sans-serif typography, navy/sea-blue accents, and cleaner note cards.
- Added light and true-black dark mode through shared CSS variables, including forms, dialogs, native inputs, and notifications.
- Added an accessible Dark mode switch with system defaults, browser persistence, cross-tab synchronization, and a storage-blocked fallback.
- Applied the theme before first paint to prevent a bright flash on startup.
- Renamed displayed note colors to Sand, Seafoam, Coral, Iris, and Sea blue; preserved stored IDs and Firebase identity.
- Updated build output to `dist/shipyard/browser`, documentation, and screenshots.
- Passed seven browser scenarios, including responsive and accessibility checks in both themes, and the optimized production build.

## 1.0.0 - 2026-09-12

- Created Pinboard with Angular 20, AngularFire 20, and real Firestore CRUD.
- Added anonymous private boards, owner-scoped rules, and local emulator export/import.
- Added reactive create/edit forms, completion toggles, and delete confirmation.
- Added five sticky-note colors, categories, priorities, due dates, search, filtering, and sorting.
- Built responsive custom CSS with SVG icons, accessible controls, and connection/success feedback.
- Added browser CRUD, persistence, isolation, responsive/accessibility, and Firestore rules tests.
- Added beginner comments, pseudocode, setup documentation, architecture walkthrough, and a guarded cloud build.
- Corrected secondary-text contrast and keyboard focus after deletion during verification.
