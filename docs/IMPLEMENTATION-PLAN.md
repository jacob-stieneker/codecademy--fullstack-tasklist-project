# Implementation plan and requirements

Source: [Tasklist Board assignment](https://docs.google.com/document/d/1ImDWw5FwpNDYZmGsJuGsHX1i9iRftOK5UqO1zp7ocoY/edit), read September 12, 2026.

Build a sticky-note style Angular application with Firebase/AngularFire create, read, update, and delete. Refreshes must preserve tasks. Use custom responsive CSS, useful empty states, feedback, clear edit/delete controls, and understandable code. Assignment deadline: September 17, 2026, beginning of class.

1. Establish compatible stable Angular/AngularFire dependencies and routes.
2. Connect a reactive create form to an AngularFire service and Firestore.
3. Subscribe to task documents, confirm refresh persistence, then implement delete and edit.
4. Style the responsive board with custom CSS and accessible interactions.
5. Add completion, categories/colors, due dates, priority, search, filters, and sorting.
6. Verify real emulator CRUD, validation, isolation rules, navigation, responsive layouts, and production build.
7. Document setup, architecture, Firebase connection, tests, and submission steps.

Technical decisions:
- Latest stable AngularFire is 20.0.1 with Angular ^20 peer dependencies, verified against npm. Use Angular 20.3 patches and supported modern signal APIs.
- Standalone components, input()/output(), inject(), signals/computed(), @if/@for, typed reactive forms, and modular AngularFire imports.
- Use separate board and shared create/edit pages. Keep all database access in TaskService.
- User approved local Firebase emulators. No production infrastructure is created or published.
- Anonymous Firebase Authentication gives each browser a private board, with owner-scoped security rules. Auth persists across normal refreshes.
- Default builds intentionally use emulators. A separate guarded cloud build requires explicit configuration.
- Never substitute localStorage for Firestore. Emulator export/import preserves the local database across graceful restarts.

Completed: all seven implementation steps. See VERIFICATION.md for the final results and the remaining cloud/tooling limitations.

## Shipyard visual update

User requested Shipyard, "Plan. Track. Ship.", a small SVG ship logo, a modern blue maritime palette, and light/dark modes.

Implementation: preserve CRUD and stored data; replace hardcoded component colors with shared theme tokens; add a signal-based theme service and accessible switch; apply the initial theme before first paint; update the brand, CSS, favicon, build name, docs, and screenshots. Keep the local Firebase project and stored color IDs unchanged. Verify system/saved theme behavior, storage errors, keyboard access, contrast, and responsive layouts in both themes, then run a production build.

Completed: seven browser scenarios and the optimized build pass. Both themes were visually reviewed on desktop and mobile.

## Simplified task board update

User requested a simpler Task Board with the slogan under the logo, active-task sidebar links, Planning/Tracking/Shipped statuses, category-based sticky-note colors, a Light/Dark dropdown, and the tab title "Shipyard | My Board". The progress meter is optional in the assignment and was removed as requested.

Plan: simplify the shell and remove promotional blocks; add statuses and derived category colors while adapting older saved tasks; update cards/forms/rules together; verify CRUD, navigation, persistence, both themes, accessibility, and responsive layouts; refresh documentation and screenshots.

Implementation uses a single status field and shared category-color mapping, with matching Firestore validation. Existing document IDs and anonymous identities remain intact. New browser coverage checks legacy records and repeated sidebar navigation as well as the requested UI changes. See VERIFICATION.md for results.

## Further styling simplification

Plan: preserve all theme and category color values; flatten note cards, simplify typography and filter states, remove duplicate add-card decoration, and simplify forms/dialogs. Keep current task operations and accessible controls. Verify the existing browser suite, mobile/desktop layouts, both themes, and the optimized build, then refresh screenshots and documentation.

Completed in 1.2.1: seven browser scenarios and the optimized build pass. Reviewed light desktop, dark mobile, and mobile form screenshots. Existing CRUD, persistence, sidebar links, and theme behavior remain covered by the suite. No Firebase data model or rules changes were needed.

## Status columns and drag-and-drop

Plan: add Angular CDK 20.2.14, compatible with the existing Angular 20 app; group notes into Planning/Tracking/Shipped columns; save drops through the current status update service; preserve styling, category colors, edit controls, search and sorting; keep all columns available with contained horizontal scrolling on phones. Verify mouse/touch moves, refresh and multi-tab persistence, rejected-write recovery, accessibility, and the optimized build.

The drop handler changes only status. A same-column drop does not reorder notes. Confirmed Firestore data remains the source of truth, and failed writes leave the note in its original column. The edit form and note menu remain alternatives to dragging. Completed: eleven browser scenarios pass on both development and optimized builds, and all six rule tests pass. See VERIFICATION.md for details.

## Expanded task views and Help

Plan: derive active/completed sidebar lists and counts from the live task store; open a category-colored native dialog through sidebar links, double-click, or Enter; retain search/category filters and restore focus on close; handle realtime changes and missing tasks. Add a concise Help guide at the bottom of the sidebar, with Close/Escape returning to the board. Verify both themes, mobile/desktop layouts, accessible dialogs, existing CRUD/dragging, and optimized compilation. No database schema or dependency changes are needed.

Completed: fourteen browser scenarios pass on both development and optimized builds; six Firebase rule tests pass. Light/dark screenshots, mobile layouts, task details, and Help were reviewed. Updated the README, beginner walkthrough, verification report, and screenshots.
