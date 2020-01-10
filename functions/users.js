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

exports.deleteAccount = ({ email }, agentId) => {
  return adspl
    .auth()
    .getUserByEmail(email)
    .then(function(userRecord) {
      const user = userRecord.toJSON();

      const date = new Date().toISOString();
      return adspl
        .auth()
        .deleteUser(user.uid)
        .then(() => {
          return crm
            .database()
            .ref('/activities/' + agentId + '/' + moment().format('DD_MM_YYYY'))
            .push({
              scope: 'adspl',
              date,
              task: 'delete-account',
              input: { email },
            })
            .then(() => {
              return adspl
                .database()
                .ref('/users/' + user.uid + '/accountRemoved')
                .set({
                  date,
                  by: agentId,
                });
            });
        });
    });
};
