const moment = require('moment');
const { adspl, crm } = require('./connections');

exports.updateVerifiedEmail = ({ userEmail, userSiren }, userId) => {
  const db = adspl.database();
  return db
    .ref(`indexes/userSirens/${userSiren}/uid`)
    .once('value')
    .then(snap => snap.val())
    .then(uid =>
      db
        .ref(`users/${uid}/email`)
        .once('value')
        .then(snap => snap.val())
        .then(email => {
          if (email === userEmail) {
            return adspl
              .auth()
              .updateUser(uid, {
                emailVerified: true,
              })
              .then(() => {
                return crm
                  .database()
                  .ref('/activities/' + userId + '/' + moment().format('DD_MM_YYYY'))
                  .push({
                    scope: 'adspl',
                    date: Date.now(),
                    task: 'activate-email',
                    input: { id: userSiren, email: userEmail },
                  });
              });
          }
          console.error(`${userEmail} should not be updated. (email mismatch)`);
          return Promise.reject(new Error("L'email n'existe pas en base de données."));
        }),
    );
};
