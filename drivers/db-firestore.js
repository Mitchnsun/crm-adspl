import firebase from 'firebase/app';
import 'firebase/firestore';

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

  const db = firebase.firestore();

  return name => {
    const collection = db.collection(name);

    return {
      reset() {
        return collection.get().then(snapshot => {
          if (snapshot.empty) {
            return [];
          }

          snapshot.forEach(doc => {
            collection.doc(doc.id).delete();
          });
        });
      },
      generateId() {
        return db.collection(name).doc().id;
      },
      getAll(paginationConfig = {}) {
        let query = collection.where('_archived', '==', false);

        if (name === 'tickets' || name === 'test') {
          if (paginationConfig.follower) {
            query = query.where('followers', 'array-contains', paginationConfig.follower);
          }

          if (paginationConfig.status) {
            query = query.where('status', '==', paginationConfig.status);
          }
        }

        query = query.orderBy('createAt', 'desc');

        if (paginationConfig.startAfter) {
          query = query.startAfter(paginationConfig.startAfter._doc);
        }

        if (paginationConfig.limit) {
          query = query.limit(paginationConfig.limit);
        }

        return query.get().then(snapshot => {
          if (snapshot.empty) {
            return [];
          }
          const all = [];
          snapshot.forEach(doc => {
            const { _archived, ...data } = doc.data();
            all.push({ ...data, _doc: doc });
          });
          return all;
        });
      },
      get(id) {
        return collection
          .doc(id)
          .get()
          .then(doc => {
            if (!doc.exists) {
              return null;
            } else {
              const { _archived, ...data } = doc.data();
              return data;
            }
          });
      },
      add(data) {
        if (name === 'tickets' || name === 'test') {
          return collection.doc(data.id).set({ status: 'PENDING', followers: [], ...data, _archived: false });
        }
        return collection.doc(data.id).set({ ...data, _archived: false });
      },
      remove(id) {
        return this.get(id).then(data => collection.doc(data.id).set({ ...data, _archived: true }));
      },
      update(data) {
        return collection
          .doc(data.id)
          .set({ ...data, _archived: false })
          .then(() => this.getAll());
      },
    };
  };
}
