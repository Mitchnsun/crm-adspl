import firebase from 'firebase/app';
import 'firebase/database';

export default function createDb() {
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

  const db = firebase.database();

  return (name, uid) => {
    const path = uid ? `${name}/${uid}` : name;
    return {
      reset() {
        return db.ref(`${path}`).set({});
      },
      generateId() {
        return db.ref(`${path}`).push().key;
      },
      getAll() {
        return db
          .ref(`${path}`)
          .once('value')
          .then(snap => snap.val())
          .then(r => {
            if (r) {
              return Object.keys(r)
                .map(k => r[k])
                .filter(d => !d._archived);
            }
            return [];
          });
      },
      get(id) {
        return db
          .ref(`${path}/${id}`)
          .once('value')
          .then(snap => snap.val());
      },
      add(data) {
        return db.ref(`${path}/${data.id}`).set(data);
      },
      remove(id) {
        return db.ref(`${path}/${id}/_archived`).set(true);
      },
      update(data) {
        return db
          .ref(`${path}/${data.id}`)
          .set(data)
          .then(() => {
            return db
              .ref(`${path}`)
              .once('value')
              .then(snap => snap.val())
              .then(r => {
                if (r) {
                  return Object.keys(r)
                    .map(k => r[k])
                    .filter(d => !d._archived);
                }
                return [];
              });
          });
      },
    };
  };
}
