// Copy the PUBLIC web app configuration from your Firebase project's settings here.
// Never put a service account key or other private credential in a frontend application.
// npm run build:cloud refuses to build until these placeholders are replaced.
export const environment = {
  useEmulators: false,
  firebase: {
    apiKey: 'REPLACE_WITH_PUBLIC_API_KEY',
    authDomain: 'REPLACE_WITH_PROJECT_ID.firebaseapp.com',
    projectId: 'REPLACE_WITH_PROJECT_ID',
    appId: 'REPLACE_WITH_PUBLIC_APP_ID',
  },
};
