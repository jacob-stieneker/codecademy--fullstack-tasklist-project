# Assignment sanity check

Reviewed September 12, 2026 against the current [Tasklist Board handout](https://docs.google.com/document/d/1ImDWw5FwpNDYZmGsJuGsHX1i9iRftOK5UqO1zp7ocoY/edit?tab=t.0), including its code examples and sections 1 through 12. This report covers Shipyard's current source and its optimized build.

**Result:** no missing core application behavior was found in the user-approved local Firebase setup. Eleven browser scenarios pass on both the development app and the optimized build. Six Firestore security-rule tests pass, including a repeated run. The implementation follows the examples' architecture and CRUD operations, with the differences below. This is a technical check, not confirmation of the instructor's acceptance of local emulators or of contest submission completion.

## Core requirements

| Handout requirement | Current implementation and evidence | Result |
| --- | --- | --- |
| Angular application | Standalone Angular components, typed templates, router, reactive forms, and strict TypeScript. Optimized build succeeds without build warnings or errors. | Pass |
| Firebase through AngularFire | `app.config.ts` supplies Firebase, Auth, and Firestore. `TaskService` imports the modular AngularFire APIs and connects to real Auth/Firestore emulators. | Pass in selected local environment |
| Create tasks | Labeled reactive form sends validated title/description and task fields through `addTask()` to `addDoc()`. Firestore generates the ID and timestamp. Direct database checks verify the submitted records. | Pass |
| Read tasks | The listener maps Firestore IDs to task IDs. With Everything selected and search empty, the board displays every task in the signed-in user's collection. A ten-task test compares all displayed IDs with Firestore. | Pass |
| Update tasks | `/tasks/:id/edit` loads the selected task and prefills the shared form. `updateDoc()` changes that document. The test verifies all edited fields, unchanged document ID/creation time, and an untouched neighboring record. | Pass |
| Delete tasks | Card action opens confirmation and calls `deleteDoc()` with the selected ID. First and middle task deletion produces database 404 responses and the correct remaining ID set after refresh. | Pass |
| Refresh persistence | Created, edited, completed, and deleted states are verified after reload against the emulator database. Task content is not saved in localStorage. | Pass |
| Custom CSS and sticky-note board | Colored rectangular notes, CSS grid, clear actions, empty states, status columns and category filters, and responsive layouts. Light and dark modes retain category colors. | Pass |
| Functional demo | Create/edit/delete, status changes, filters, search, sorting, theme selection, retry, and recovery routes are wired. Runtime error capture during CRUD is empty. | Pass within tested scope |

“Every task” means every task belonging to the current private board. Anonymous users cannot read each other's collections. Filters intentionally narrow the visible list and do not remove database records.

## How our code corresponds to the examples

The handout explicitly describes its walkthrough as high level, permits signals/`toSignal`, allows different names, and says the CSS is a starting idea. Exact snippet duplication is not a stated requirement.

| Example or pattern | Shipyard equivalent | Difference to understand |
| --- | --- | --- |
| `Task` with ID, title, description, completed | [Task model](../src/app/models/task.ts) contains those fields plus status, category, color, priority, due date, and creation time. | Description is an empty string when omitted. Shipped derives `completed: true`; Planning/Tracking derive false. |
| `Omit<Task, 'id'>` for create data | `NewTask` uses `Omit` in the same model. | It additionally omits timestamp and the two fields the service derives: color and completed. |
| `FormGroup`, `FormControl`, `[formGroup]`, `formControlName`, `(ngSubmit)`, `getRawValue()` | [Task form component](../src/app/pages/task-form/task-form.ts) and [template](../src/app/pages/task-form/task-form.html). | The create and edit pages share one component, with validation and awaited saves. |
| Root-provided service and `inject(Firestore)` | [TaskService](../src/app/services/task.service.ts). | Anonymous authentication scopes the collection to `users/{uid}/tasks`, rather than a shared top-level `tasks` collection. |
| `collection()` and `addDoc()` | `TaskService.addTask()`. | Adds a server timestamp and derives category color/completion. |
| `collectionData(..., { idField: 'id' })` and observable/async rendering | `onSnapshot()` maps `item.id` into a read-only task signal; `@for` tracks `task.id`. | This is an intentional alternative, not a literal use of `collectionData()`. It supports connection metadata, confirmed writes, and listener cleanup. |
| `ActivatedRoute`, `docData()`, `patchValue()` | Route parameters use `toSignal`; a computed lookup selects the record from the live collection; an effect calls `patchValue()`. | There is no separate `getTask()`/`docData()` subscription. The form still loads current Firebase data, including when opened directly. Later snapshots do not overwrite an unsaved draft. |
| `doc()`, `updateDoc()`, and `deleteDoc()` | Same operations in the task service. | Confirmation, error handling, and success notices surround these operations. |
| `/tasks`, `/tasks/new`, `/tasks/:id/edit` and `routerLink` | [Routes](../src/app/app.routes.ts) and card/form links. | Components load lazily. A fallback route handles unknown URLs. |
| Grid and note CSS | [Board CSS](../src/app/pages/task-list/task-list.css) and [card CSS](../src/app/components/task-card/task-card.css). | Flat notes and responsive breakpoints reflect the requested simpler design. The sample shadows and rounded corners are not mandatory. |
| Temporary `console.log` checkpoints | Browser tests, confirmed-write notifications, direct database checks, and beginner comments. | Debug logging is not left in the application. The examples use it as a development checkpoint, not a final feature. |

The form APIs remain documented Angular APIs: [reactive forms](https://angular.dev/guide/forms/reactive-forms). The component APIs use [signal inputs](https://angular.dev/guide/components/inputs), `output()`, `inject()`, `@if`, and `@for`. No legacy input/output decorators, `*ngIf`/`*ngFor`, or AngularFire compat imports are present in application source. Firebase documents the underlying [snapshot listener](https://firebase.google.com/docs/firestore/query-data/listen); this project imports it through [AngularFire](https://github.com/angular/angularfire).

If the instructor separately requires the literal `collectionData()`/`docData()` method names or has a narrower list of class-approved approaches, that instruction would need a separate check. The provided handout does not require verbatim code.

## Functional and behavior checks

- Normal task creation and whitespace-only title rejection.
- One task, several tasks, and ten tasks; all IDs match the current user's Firestore collection.
- Task A and Task B each prefill correctly when opened in sequence.
- Multi-field update with exact database readback; Task B's complete document remains unchanged.
- First and middle task deletion, direct database verification, and reload persistence.
- Long unbroken titles/descriptions do not cause page overflow at 320, 390, 768, 1024, and 1440 pixels.
- Form layouts fit at 320, 768, and 1440 pixels.
- Planning, Tracking, and Shipped persist, synchronize between tabs, and update active-task links.
- Search, category filtering, priority sorting, sidebar task details, and filter reset work together.
- Create/edit/delete feedback, delete cancellation, keyboard focus restoration, and connection retry work.
- Light/dark board, form, and delete-dialog accessibility scans report no detected WCAG A/AA violations.
- Owner CRUD succeeds; unauthenticated/cross-user access, invalid fields, inconsistent status/color values, and forged timestamps are rejected.
- Older saved records still display and save using the current schema.
- The same eleven browser scenarios pass against compiled files, including direct edit links and missing routes.

## Optional features and deliberate omissions

Completion, category colors, due dates/overdue labels, priority, search, filters, confirmation, success notices, and themes are implemented. The requested three status names replace the sample active/completed wording while keeping a stored completion boolean.

Drag-and-drop is now implemented with Angular CDK: moving a note between Planning, Tracking, and Shipped updates its saved status. Sorting controls the order within each column. Creation time is stored and used for sorting; a visible creation-time label is not implemented. The progress meter is not a core requirement and remains removed. None of these omissions prevents the mandatory CRUD flow.

## Changes made during this check

1. Added direct Firestore verification for ten notes, multiple-field edits, unchanged neighboring records, and first/middle deletion in [browser tests](../tests/e2e/board.spec.ts).
2. Narrowed the legacy-record test to its own anonymous user's document instead of querying every board.
3. Fixed [rule test setup](../tests/firestore.rules.test.mjs): old fixtures made repeat runs try to overwrite immutable creation timestamps. The suite now clears only the separate `demo-pinboard-rules` project before running. Application data and rules are unchanged.
4. Added `npm run test:build`, [build test configuration](../playwright.build.config.ts), and a small [local build preview server](../scripts/preview-build.mjs), so the same flows run against the optimized output.

No application behavior or styling changes were needed for the original assignment alignment check. A later user-requested update added status columns and drag-and-drop, with the same palette and CRUD service. Mouse/touch moves, persistence, and rejected-drop recovery are covered by three additional browser scenarios.

## Submission boundaries

- Local Firebase emulators remain the development/test default. The app is also published at [Shipyard](https://shipyard-jacob-stieneker.web.app) in the owner's Firebase project, with live Authentication, Firestore, rules, and Hosting on Spark without billing. Live CRUD and server-side access controls passed the deployment smoke checks. See [Firebase setup](FIREBASE-SETUP.md) for the two environments and deployment commands.
- Normal refresh preserves the anonymous board. A different browser/device or cleared site data creates a separate identity. Emulators must be running; graceful shutdown exports their data.
- The handout's deadline is September 17, 2026 at the beginning of class. It also asks for a screenshot/demo and LinkedIn/Discord sharing. Screenshots are available; posting, tagging, submitting the link, explaining the implementation, and following updated instructor guidance remain the student's actions. No social messages were sent.
- Browser checks used Chromium. They do not establish Safari/Firefox behavior or constitute a complete assistive-technology audit. Existing tooling dependency advisories remain documented in [verification notes](VERIFICATION.md); dependency remediation was not part of this assignment check.

## Reproduce

Keep the local Firebase emulators running, then use:

```bash
npm test
npm run test:build
```

`npm test` checks the development app and Firestore rules. `npm run test:build` builds Shipyard and runs all eleven browser scenarios on a temporary loopback server at port 4300. The regular preview remains at port 4200. Tests use new anonymous browser users and an isolated rule-test project, preserving the user's working board.
