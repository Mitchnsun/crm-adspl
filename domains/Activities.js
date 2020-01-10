import firebase from 'firebase/app';
import 'firebase/database';
import moment from 'moment';

export default function createActivities() {
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

  const db = firebase.database();
  return {
    getActivities(date, uid, user) {
      if (!user.isAdmin()) return Promise.resolve();
      // date format: DD_MM_YYYY
      return db
        .ref('/activities/' + uid + '/' + date)
        .once('value')
        .then(s => s.val())
        .then(res => (res ? Object.values(res) : []));
    },
    log(event, user) {
      return db.ref('/activities/' + user.id + '/' + moment().format('DD_MM_YYYY')).push(event);
    },
  };
}
