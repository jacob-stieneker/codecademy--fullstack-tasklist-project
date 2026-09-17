# Changelog

## 2026-10-12: Project setup and task creation

- Set up the Angular project, page routes, task model, and a service for database operations.
- Connected AngularFire to local Firebase Authentication and Firestore emulators.
- Built the new-task form with title validation and an optional description.
- Connected form submissions to Firestore and checked that new tasks were saved with generated IDs.

## 2026-10-15: Complete the CRUD flow

- Displayed saved tasks on the board with live Firestore updates and an empty state.
- Added deletion by task ID with confirmation before removing a note.
- Built the edit flow with a prefilled form that saves changes to the selected task.
- Checked that creating, editing, and deleting tasks persisted after refresh and left other tasks unchanged.
- Added the initial sticky-note CSS, responsive layout, and private-board access rules.

## 2026-10-16: Branding and board features

- Named the app Shipyard and introduced the ship icon, "Plan. Track. Ship." slogan, and sea-blue/navy palette.
- Refined the sticky-note styling with yellow Work, blue Personal, and pink Learning categories, plus light and dark themes.
- Organized notes into Planning, Tracking, and Shipped columns with drag-and-drop status changes.
- Added search, category filters, priorities, due dates, and sorting.
- Added expanded task views and active/completed sidebar lists with live counts.
- Connected the cloud configuration and published the app through Firebase Hosting.

## 2026-10-17: Final checks and finishing touches

- Added the short Help guide and footer quotation, and removed the redundant drag icon.
- Tidied spacing and wording across the board, forms, and dialogs.
- Checked the final build, live CRUD, drag-and-drop, refresh persistence, private-board permissions, and responsive layouts.
- Simplified the README to cover the app and launch instructions, and removed redundant documentation and archived screenshots.
