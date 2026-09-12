import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch(() => {
  // A startup failure should leave a readable message instead of a blank page.
  document.body.textContent = 'Shipyard could not start. Please reload the page and check your Firebase configuration.';
});
