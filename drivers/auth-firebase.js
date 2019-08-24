import firebase from 'firebase/app';
import 'firebase/auth';

export default function createDriver() {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_API_ID,
    });
  }

  return {
    login(email, password) {
      return firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(({ user }) => user.uid);
    },

    logout() {
      return firebase.auth().signOut();
    },

    createAccount({ email, password }) {
      return firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(({ user }) => user.uid);
    },

    listen(cb) {
      return firebase.auth().onAuthStateChanged(cb);
    },
  };
}
