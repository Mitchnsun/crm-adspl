import firebase from 'firebase/app';
import 'firebase/auth';

export default function createDriver() {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: 'AIzaSyC-rAaLUJI5ET0kaA5FiMCn-8d6elmd5Ro',
      authDomain: 'adspl-crm-test.firebaseapp.com',
      databaseURL: 'https://adspl-crm-test.firebaseio.com',
      projectId: 'adspl-crm-test',
      storageBucket: '',
      messagingSenderId: '805016761628',
      appId: '1:805016761628:web:11ba5fa71410346e',
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
