// Local development uses real Firebase SDKs connected to emulators. No cloud account is needed.
export const environment = {
  useEmulators: true,
  firebase: {
    apiKey: 'demo-pinboard-key',
    authDomain: 'demo-pinboard.firebaseapp.com',
    projectId: 'demo-pinboard',
    appId: 'demo-pinboard-app',
  },
};
