# How Shipyard works

## The four layers

Every button follows the same path:

```text
HTML template -> Angular component -> TaskService -> Firebase
Firebase -> TaskService signal -> Angular template
```

The assignment calls this BLT: Build it, Link it, Test it. To understand a feature, follow it across those layers rather than reading every file at once.

## Task model

`src/app/models/task.ts` describes a task. `id` identifies a Firestore document. The editable fields are title, description, status, category, priority, and dueDate. The service derives `completed` from status and `color` from category. Firestore sets `createdAt` with a server timestamp.

`NewTask = Omit<Task, 'id' | 'createdAt' | 'completed' | 'color'>` excludes fields that Firestore or the service supplies. `TaskChanges = Partial<NewTask>` means an update may contain just one editable field, such as `{ status: 'Shipped' }`.

The `as const` arrays define a small set of allowed category/status/priority values. Their types prevent accidentally passing an unsupported value in TypeScript. Firestore rules independently validate the data because browser code can be modified by a user.

`STATUSES` defines Planning, Tracking, and Shipped. `CATEGORY_COLORS` maps Work to `butter`, Personal to `sky`, and Learning to `rose`. These internal color names are CSS classes. The user only chooses a category. Rules require matching status/completion and category/color values.

Older records without `status` are adapted when read: completed tasks become Shipped, and others become Planning. Their displayed colors follow the category. Updating one of these tasks writes the new fields without replacing its document ID or creation time.

## CREATE: put a thought on the board

Open `pages/task-form/task-form.html`. Each `formControlName` connects an input to a control in the component's `FormGroup`. `(ngSubmit)="save()"` calls the component when the form is submitted. Buttons inside forms explicitly state their type.

The `save()` method checks validation, trims spaces, and gets the typed data with `getRawValue()`. If the URL does not contain a task ID, it calls `TaskService.addTask()`.

```ts
// Psudo code //
// First read and validate the form.
// Then pass the new task to the service.
// Let Firestore assign the document ID and creation timestamp.
// Wait for the write to finish, then return to the board.
```

The service calls AngularFire's modular `addDoc()`. `await` is important: without it, the app could announce success before Firebase has saved anything. A failed save leaves the user's draft in the form.

## READ: show live notes

`TaskService.connect()` restores the browser's Firebase user or creates an anonymous user. Anonymous means no email/password form is needed. The database path is:

```text
users/{Firebase user ID}/tasks/{Firestore document ID}
```

The service uses AngularFire's `onSnapshot()` to receive changes. Unlike a one-time fetch, the listener stays active. It copies documents into a `signal<Task[]>([])`. Calling `tasks()` reads the current array. Angular automatically updates templates that read this signal.

The listener includes snapshot metadata so the app can distinguish server-confirmed data from a disconnected cache or an unconfirmed write. It is unsubscribed when the service is destroyed.

The board renders notes with `@for (task of visibleTasks(); track task.id)`. Tracking IDs keeps each note tied to the same task even when the array order changes.

`computed()` derives filtered tasks and status counts from the source data. These are derived values, not extra database copies. Filtering and sorting happen locally after the user-owned collection is read, so no composite Firestore indexes are needed.

## UPDATE: edit the right note

An Edit link opens `/tasks/<document-id>/edit`. The shared form reads that ID from Angular's route parameters, finds the task in the Firestore-backed signal, and calls `patchValue()` to prefill the form once. Subsequent database events do not overwrite unsaved typing.

On submit, the service calls `updateDoc()` on that exact ID. It does not replace the whole collection or assign a new ID. Changing a task status uses the same method with a smaller object.

```ts
// Psudo code //
// First identify the existing task from its document ID.
// Then let the user edit its current values.
// Send the changed fields to that document only.
// Let the live Firestore listener refresh the board.
```

## Drag a note into another status column

Angular CDK supplies `CdkDrag`, `CdkDragHandle`, `CdkDropList`, and `CdkDropListGroup`. The card's title/details area is its drag handle, so Edit, Delete, and the status menu still behave like normal controls. A short touch delay leaves ordinary scrolling available.

The board's `columns` computed value groups filtered/sorted tasks by status. Each drop list carries its status in `cdkDropListData`, and each draggable note carries its task in `cdkDragData`. `dropTask()` reads those values and calls the same `changeStatus()` method used by the note menu.

```ts
// Psudo code //
// First read the dragged task and the destination column.
// Then save the destination status through TaskService.
// Wait for Firebase to confirm the update.
// Let the live task signal put the note in the correct column.
```

There is no separate local copy of the board to save. The service derives `completed` from the new status and keeps the category color consistent. Rejected writes leave the note in its original column and show an error. A second drag can retry. Dropping within the same column does nothing because the selected sort order controls placement.

The three status columns replace the separate status filter row. All drop targets remain available during category/search filtering, and those filters stay selected after a move. `CdkScrollable` lets the CDK scroll the board when a dragged note reaches an edge. The note menu and edit form provide alternatives to dragging for keyboard users.

## DELETE: remove the intended note

The task card emits `deleteRequested` with the selected task. The parent opens a native HTML dialog. The dialog traps focus and initially focuses Keep task. Escape cancels.

After confirmation, `TaskService.deleteTask(id)` calls `deleteDoc()`. The UI waits for confirmation, closes the dialog, returns keyboard focus to the board heading, and announces success. The Firestore listener removes the deleted note. The delete button is disabled while the request is running.

## Signals and component communication

`TaskCard` receives `task = input.required<Task>()`. The parent binds it with `[task]="task"`. Read the value inside the child as `task()`.

The child exposes `statusChanged = output<{ task: Task; status: TaskStatus }>()`. It emits the task and selected status. The parent connects it with `(statusChanged)="changeStatus($event)"`. This keeps the card focused on presentation and the service focused on database work.

`toSignal()` bridges existing observable APIs, such as route parameters and reactive form changes, into Angular signals. `effect()` prefills the edit form when its task arrives. It is intentionally limited to this side effect; calculated lists use `computed()`.

AngularFire wraps Firebase calls with Angular dependency injection. `runInInjectionContext()` in the service keeps calls valid even when they occur after an `await` or in a click handler.

The My Board sidebar derives two lists with `computed()`: Planning/Tracking tasks are active, and Shipped tasks are completed. Each count comes from its list length. Sidebar links put a task ID in the route query. Double-clicking a note or pressing Enter on it emits `viewRequested`, which sets the same query.

The board finds the selected task in the live store and passes it to `TaskDetail`. Its native dialog shows the full note without changing the board filters. Updates from other clients appear automatically; a deleted or missing task shows an unavailable message. Closing removes the query and restores focus to the original link or note when it still exists.

`BoardHelp` is a separate native dialog containing a short user guide. The shell opens it above the board from the Help button. Both dialogs use signal inputs/outputs and native focus trapping, with Close and Escape support. Neither creates or changes Firebase documents.

## Styles and accessibility

Shipyard's `src/styles.css` defines semantic color variables such as `--canvas`, `--surface`, `--ink`, and `--accent`. Components use these variables instead of hardcoded light colors. The `[data-theme='dark']` block replaces the variable values with a true-black background, dark surfaces, and readable light text. The yellow Work, blue Personal, and pink Learning note backgrounds also adapt.

`ThemeService` starts with a saved preference or the operating system's color scheme. The top-bar dropdown calls `setTheme()`, which updates a signal, the document's theme attribute, and the browser's `shipyard-theme` preference. It watches system changes until a manual choice is made and synchronizes saved choices across tabs. Storage errors are caught so the dropdown still works. A short script in `index.html` sets the same attribute before rendering, preventing a flash of the wrong theme. This browser-only preference is separate from Firebase task data.

`src/styles.css` defines shared colors, buttons, focus styling, and note colors. Each component keeps its own layout CSS nearby. Notes use flat category-colored backgrounds and plain text, with no tape, folded corners, shadows, or hover motion. Selected filters use underlines as well as color. The board always has three status columns. A contained horizontal scroll area keeps notes readable on smaller screens without making the whole page overflow. Long text wraps with `overflow-wrap: anywhere`.

Icons are local SVG paths rather than emoji. Inputs have labels. Icon-only controls have accessible names. Success notifications use a polite live region. Reduced-motion preferences disable animation. Automated checks cover contrast and other detectable accessibility issues, but do not replace a full screen-reader review.

## Debug one boundary at a time

1. Does the route open? Check `app.routes.ts` and the link.
2. Does the form contain the expected values? Inspect `form.getRawValue()` locally.
3. Does the component call the expected service method?
4. Is Firebase connected? Check the footer and the emulator terminal.
5. Does the matching document appear in the Emulator UI?
6. Do permissions or field validation reject the request? Read `firestore.rules`.

Do not log credentials or private task content in production. The finished application does not contain temporary console logging.
