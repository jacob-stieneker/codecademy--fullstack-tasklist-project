# Firebase setup

## Local mode, already configured

The user's selected environment is the Firebase Emulator Suite. The default config uses project ID `demo-pinboard`, Auth at `127.0.0.1:9099`, and Firestore at `127.0.0.1:8080`. The emulator project ID and the browser config must match. The `demo-` prefix prevents accidental use of real cloud resources for services that are not emulated.

`npm run emulators` handles Auth/Firestore startup and database export/import. `npm start` starts Angular. The emulator UI is at port 4000. The hub uses 4400, logging uses 4500, and Firestore's UI websocket uses 9150. All are bound to loopback; this is a local development setup, not a remotely hosted demo.

The script looks for Java on your system or at `.tools/java/Contents/Home/bin` on the original Mac. The local runtime is ignored by Git, so another machine needs Java 21. First-run downloads and dependency installation need internet access. Once installed, normal local task operations use the emulators.

See the official [Emulator Suite setup](https://firebase.google.com/docs/emulator-suite/install_and_configure) for prerequisites and export/import behavior.

## Inspect database writes

1. Create a task in Shipyard.
2. Open the Emulator UI, then Firestore.
3. Expand `users`, select your anonymous UID, and open `tasks`.
4. Verify title, description, status, completed, category, color, priority, dueDate, and createdAt.
5. Edit the task in the app, then confirm the same document changes.
6. Delete it, then confirm that exact document disappears.
7. Refresh the app and confirm it stays deleted.

Status is Planning, Tracking, or Shipped. `completed` is true only for Shipped. Work uses `butter` (yellow), Personal uses `sky` (blue), and Learning uses `rose` (pink). The service supplies these derived values, and the rules validate them. When connecting a hosted project, deploy the current rules together with this app version.

Firestore may show the parent user document as nonexistent because only its `tasks` subcollection contains data. That is normal. Browser authentication identity is stored by the Firebase SDK; task content is stored in Firestore.

## Optional connection to hosted Firebase

No cloud project is connected and no production resources have been created. Before publishing, determine ownership. For a customer project, the customer must own Firebase, hosting, domains, billing, and related infrastructure. For your own project, use your own chosen account. Do not share private credentials in chat or source control.

When ready:

1. In the intended owner's Firebase account, create or select a project and register a Web app.
2. Create the default Cloud Firestore database in the intended region.
3. Enable the Anonymous provider under Authentication's sign-in methods.
4. Copy the **public web app config** into `src/environments/environment.cloud.ts`: apiKey, authDomain, projectId, and appId. These browser configuration values are not a service-account credential.
5. Sign in locally using `npx firebase login` with an account authorized for that project.
6. Publish rules/indexes to the explicitly selected project, replacing `YOUR_PROJECT_ID` below.
7. Build with the cloud configuration and deploy only after confirming the destination and ownership.

```bash
npx firebase deploy --only firestore:rules,firestore:indexes --project YOUR_PROJECT_ID
npm run build:cloud
npx firebase deploy --only hosting --project YOUR_PROJECT_ID
```

These commands are documentation, not actions performed during this build. Leave `.firebaserc` set to the demo project to keep local testing safe. The cloud build refuses the provided placeholders. Do not upload the normal emulator-targeting `npm run build` output as a public site.

Firebase Hosting's SPA rewrite is included so directly opening `/tasks/<id>/edit` loads Angular. No server-side rendering or paid application server is required by this source project. Review your selected cloud project's usage and account requirements before publishing.

The implementation follows Firebase's [web setup](https://firebase.google.com/docs/web/setup), [anonymous authentication](https://firebase.google.com/docs/auth/web/anonymous-auth), and [Hosting setup](https://firebase.google.com/docs/hosting/quickstart) documentation.

## Limits of anonymous boards

A browser profile retains access across normal refreshes and restarts. A new browser or device gets a separate board. Clearing site data loses the local sign-in and access to that anonymous account; there is no account recovery flow. For long-term cross-device use, add an explicit sign-in provider and link the anonymous account to it before clearing browser data.

Emulator data is not copied into a hosted Firebase project automatically. Cloud setup starts a separate dataset. Preserve `.firebase-data` if you want to retain local tasks. A crash or forced termination can lose changes since the most recent export.
