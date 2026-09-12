# Shipyard

**Plan. Track. Ship.**

A complete sticky-note task board built with Angular, AngularFire, Firebase Authentication, Cloud Firestore, and custom CSS. Built for the [Tasklist Board assignment](https://docs.google.com/document/d/1ImDWw5FwpNDYZmGsJuGsHX1i9iRftOK5UqO1zp7ocoY/edit).

Source repository: [jacob-stieneker/shipyard-project](https://github.com/jacob-stieneker/shipyard-project).

Live app: [Shipyard](https://shipyard-jacob-stieneker.web.app). Hosted in the owner's Firebase project on the no-cost Spark plan, with live anonymous Authentication and private Firestore boards. No billing account is linked. Local emulator notes remain separate from the live board.

## Start the project

Prerequisites: Node.js 22.12+ or Node.js 24, npm, and Java 21. On the original development machine, an ignored project-local Java runtime is already installed in `.tools/java`. On another machine, install Java 21 and make `java -version` work in your terminal. No Firebase account, billing, or secrets are needed for local development.

```bash
git clone https://github.com/jacob-stieneker/shipyard-project.git
cd shipyard-project
npm ci
```

In terminal one:

```bash
npm run emulators
```

In terminal two:

```bash
npm start
```

Open [Shipyard](http://127.0.0.1:4200). Inspect real documents in the [Firebase Emulator UI](http://127.0.0.1:4000). The first emulator run downloads the required emulator files.

Stop the emulators with Ctrl+C and wait for the export to finish. The next `npm run emulators` restores `.firebase-data`, including Authentication and Firestore. Do not force-kill the process if you want to preserve the most recent work. Refreshing the browser does not erase tasks.

Use the same browser profile and the same URL, `http://127.0.0.1:4200`, to return to your board. `localhost` is a different browser origin. Incognito windows, different browsers, and clearing site data create a different anonymous user and therefore a different private board. The app does not offer cross-device account recovery.

## Features

- Create tasks with a required title and optional description.
- Read live Firestore updates and retain tasks after refresh.
- Edit a task through a pre-filled route, including its status.
- Delete the selected task with a keyboard-accessible confirmation dialog.
- Organize tasks in Planning, Tracking, and Shipped columns. Drag a note into another column to save its new status, or use the note menu/edit form.
- Choose a category to set the note color: Work is yellow, Personal is blue, and Learning is pink.
- Open an expanded task view from either sidebar list or by double-clicking a note (Enter when focused). Filters stay in place.
- See live counts for Active tasks (Planning/Tracking) and Completed tasks (Shipped).
- Open the short Help guide from the bottom of the sidebar; close it to return to the board.
- Set priority and optional due dates, with overdue labels.
- Search titles/descriptions, filter by category, and sort by creation, priority, or due date.
- See empty states, validation, connection errors, retry actions, and confirmed success feedback.
- Use a responsive custom CSS layout, local SVG icons, keyboard focus states, and accessible labels.
- Choose Light or Dark from the top-bar **Theme** dropdown. Dark mode has a true-black canvas with muted colored notes and blue accents.

The drag behavior uses [Angular CDK's drag-and-drop directives](https://angular.dev/guide/drag-drop). Notes are sorted within each status column. Dragging changes status, not manual order within a column. On narrow screens, scroll the board sideways to see all three columns. Touch users can hold a note briefly and drag; keyboard users can use its status menu or Edit link. Status is shown by the columns themselves. Search and category selections stay in place while dragging.

The simplified Task Board keeps the ship logo and slogan, with flat colored notes, plain typography, and simple underlined filters. There is no progress meter; the assignment does not require it. The board tab title is **Shipyard | My Board**.

Appearance follows your system until you select a mode. Your choice persists across reloads and synchronizes between tabs. Only the theme preference is stored in `localStorage`; task content stays in Firestore. If preference storage is blocked, the dropdown still works for the current session. Theme CSS is shared across the board, forms, dialogs, and feedback states.

The Shipyard rebrand preserves the original local Firebase project ID, `demo-pinboard`, and browser identity so existing boards remain accessible. Older tasks without a status display as Planning or Shipped based on their saved completion field. All notes use category colors, and editing an older task saves the new format. Application build output is now `dist/shipyard/browser`.

No mock task data is auto-inserted. A new private board starts empty. Test screenshots contain tasks created through the real application.

## Modern Angular, compatible dependencies

Angular **20.3.31**, Angular CLI/build **20.3.37**, AngularFire **20.0.1**, Angular CDK **20.2.14**, Firebase **11.10.0**, TypeScript **5.9.3**. The exact dependency tree is committed in `package-lock.json`.

AngularFire's stable npm release currently requires Angular 20. This project uses the latest compatible Angular 20 patches instead of bypassing peer checks. The code uses standalone components, `input()`, `output()`, `viewChild()`, `inject()`, `signal()`, `computed()`, `@if`, and `@for`. Forms use Angular's stable typed reactive forms. Zone-based change detection is retained for compatibility with AngularFire 20. The deprecated platform-browser-dynamic package is installed only to satisfy AngularFire's peer requirements; the application bootstraps with `bootstrapApplication` from platform-browser.

Version choices were verified on September 12, 2026 against npm, [Angular's compatibility table](https://angular.dev/reference/versions), and the [AngularFire project](https://github.com/angular/angularfire). See [Angular signal inputs](https://angular.dev/guide/components/inputs) for the component syntax.

## Project map

```text
src/app/
  models/task.ts                 Task fields and create/update types
  services/task.service.ts       Firebase connection and CRUD
  services/notice.service.ts     Success notifications
  services/theme.service.ts      System theme, saved preference, and theme dropdown
  components/icon.ts            Shared local SVG icons
  components/task-card/         A sticky note with input()/output()
  components/confirm-delete.ts   Accessible deletion dialog
  components/task-detail/        Expanded live task view
  components/board-help.ts       Concise Help guide
  pages/task-list/               Board, search, filters, sorting
  pages/task-form/               Shared create and edit form
  pages/not-found.ts             Unknown-route page
  app.routes.ts                 Routes and lazy-loaded pages
  app.config.ts                 Angular and Firebase providers
  app.ts / app.html / app.css    Workspace shell
src/environments/               Local and cloud configurations
firestore.rules                 Owner permissions and field validation
tests/                          Browser flows and rule tests
docs/                           Setup, walkthrough, and verification notes
```

Start reading with [the beginner walkthrough](docs/BEGINNER-WALKTHROUGH.md). Important methods include comments in the requested `// Psudo code //` format.

## Test and build

Keep the emulators running. Install the test browser once:

```bash
npx playwright install chromium
npm test
npm run test:build
```

See the [assignment sanity check](docs/ASSIGNMENT-CHECK.md) for a requirement-by-requirement comparison with the handout and explanations of our code adaptations.

The browser suite starts Angular automatically if it is not running. `npm test` runs Chromium UI/accessibility tests followed by Firestore rule tests. The tests use isolated anonymous browser users, with a separate project for security-rule tests. They do not clear the working board. Expected `PERMISSION_DENIED` output in rule tests means invalid requests were successfully rejected.

`npm run test:build` builds the app and runs the same fourteen browser scenarios against compiled files on a temporary local server at port 4300. It does not publish the app. Use `npm run build` when you only want the optimized output.

The production-optimized local build is written to `dist/shipyard/browser`. It still targets the local emulators. For cloud configuration and the separate `npm run build:cloud` command, see [Firebase setup](docs/FIREBASE-SETUP.md).

See [verification and known limitations](docs/VERIFICATION.md), including upstream Firebase CLI dependency advisories. The public app uses live Firebase; local development and automated browser tests continue to use emulators.

## Assignment submission

Before the September 17, 2026 class deadline, review the implementation so you can explain the template, component, service, and database flow. Test your demo with the exact browser and environment you will use. The live app above is available for a hosted demonstration; the setup guide documents future deployments.

The handout also asks for a LinkedIn project post tagging Codecademy, using `#CodecademyFullStackBootcamp`, and sharing the post link in Discord's `#project-showcase`. Those account actions remain yours to complete, following any updated instructor instructions.
