# Shipyard

**Plan. Track. Ship.**

Shipyard is a sticky-note task board built with Angular, AngularFire, Firebase Authentication, Cloud Firestore, and custom CSS. Create, edit, and delete tasks; drag notes between Planning, Tracking, and Shipped; organize them by category; and switch between light and dark mode.

## Use on the web

Open [Shipyard](https://shipyard-jacob-stieneker.web.app). No installation is needed.

Each browser has its own private board through anonymous sign-in. Tasks survive refreshes, but clearing site data loses access to that board. Different browsers and devices have separate boards.

## Run locally

Install Node.js 22.12+ (22.x) or 24.x, npm, and Java 21. Make sure `java -version` works in your terminal.

```bash
git clone https://github.com/jacob-stieneker/shipyard-project.git
cd shipyard-project
npm ci
```

Start the local Firebase emulators in one terminal:

```bash
npm run emulators
```

Start Angular in another terminal:

```bash
npm start
```

Open [http://127.0.0.1:4200](http://127.0.0.1:4200). The [Firebase Emulator UI](http://127.0.0.1:4000) lets you inspect local data.
Stop the emulators with Ctrl+C and wait for the export to finish. The next launch restores the saved data. Use the same browser and URL to return to your board. Local tasks are separate from the public app's tasks.

## Build and deploy

`npm run build` creates an optimized build that uses local emulators.

To update the public app, sign in with an account authorized for the Shipyard Firebase project, then run:

```bash
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes --project shipyard-jacob-stieneker
npm run build:cloud
npx firebase deploy --only hosting --project shipyard-jacob-stieneker
```

Build with `build:cloud` immediately before deploying. Local and cloud builds share `dist/shipyard/browser`; a local build replaces the cloud output. Public Firebase configuration lives in `src/environments/environment.cloud.ts`. Private credentials must never be committed.

To run the existing tests, keep the emulators running, install Chromium with `npx playwright install chromium`, then run `npm test`. Use `npm run test:build` to test the optimized local build.
