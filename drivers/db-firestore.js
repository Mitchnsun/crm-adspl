import firebase from 'firebase/app';
import 'firebase/firestore';

export default function createDb() {
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

          if (paginationConfig.scope) {
            query = query.where('scope', '==', paginationConfig.scope);
          }
        }

        query = query.orderBy('createAt', 'desc');

        if (paginationConfig.startAfter) {
          query = query.startAfter(paginationConfig.startAfter._doc);
        }

        if (paginationConfig.limit) {
          query = query.limit(paginationConfig.limit);
        }

        return query
          .get()
          .then(snapshot => {
            if (snapshot.empty) {
              return [];
            }
            const all = [];
            snapshot.forEach(doc => {
              const { _archived, ...data } = doc.data();
              all.push({ ...data, _doc: doc });
            });
            return all;
          })
          .catch(console.error);
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
