// Public browser configuration for the live Shipyard app, not a private credential.
// Firestore rules protect each user's board; local development still uses environment.ts.
export const environment = {
  useEmulators: false,
  firebase: {
    apiKey: 'AIzaSyBjvaHG8vZhC0upgBvvTbywihTfzVM8DF0',
    authDomain: 'shipyard-jacob-stieneker.firebaseapp.com',
    projectId: 'shipyard-jacob-stieneker',
    appId: '1:760043299510:web:42986ffca8630b8c6e7c17',
  },
};
