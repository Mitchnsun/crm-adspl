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
      getAll(paginationConfig = {}) {
        return db
          .ref(`${path}`)
          .once('value')
          .then(snap => snap.val())
          .then(r => {
            if (r) {
              let result = Object.keys(r)
                .map(k => r[k])
                .filter(d => !d._archived);

              result.sort((a, b) => {
                if (a.createAt === b.createAt) return 0;
                return b.createAt - a.createAt;
              });

              if (paginationConfig.follower) {
                result = result.filter(r => (r.followers || []).includes(paginationConfig.follower));
              }

              if (paginationConfig.status) {
                result = result.filter(r => r.status === paginationConfig.status);
              }

              if (paginationConfig.startAfter) {
                const i = result.findIndex(o => o.id === paginationConfig.startAfter.id);
                result = result.slice(i + 1);
              }

              if (paginationConfig.limit) {
                result = result.slice(0, paginationConfig.limit);
              }

              return result;
            }
            return [];
          });
      },
      get(id) {
        console.log('get', `${path}/${id}`);
        return db
          .ref(`${path}/${id}`)
          .once('value')
          .then(snap => snap.val());
      },
      add(data) {
        return db.ref(`${path}/${data.id}`).set({ followers: [], status: 'PENDING', ...data });
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
