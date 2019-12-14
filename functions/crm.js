module.exports = crm => {
  const crmDB = crm.database();
  const crmFirestore = crm.firestore();
  return {
    onReceiveGmailEmail(email) {
      if ((email.labelIds || []).includes('SENT')) {
        return Promise.resolve();
      }
      return crmDB
        .ref('/counters/tickets')
        .once('value')
        .then(snap => snap.val())
        .then(count => {
          const newCount = count + 1;
          return crmDB
            .ref('/counters/tickets')
            .set(newCount)
            .then(() => {
              const dbTickets = crmFirestore.collection('tickets');
              const id = dbTickets.doc().id;

              return dbTickets
                .doc(id)
                .set({
                  id,
                  _archived: false,
                  idNum: newCount,
                  createAt: Date.now(),
                  scope: 'adspl',
                  createBy: 'EMAIL',
                  author: 'GMAIL',
                  fromContact: email.payload.headers.find(h => h.name.toLowerCase() === 'from').value,
                  title:
                    email.payload.headers.find(h => h.name.toLowerCase() === 'from').value +
                    ' -- ' +
                    email.payload.headers.find(h => h.name.toLowerCase() === 'subject').value,
                  emailId: email.id,
                  status: 'PENDING',
                  followers: [],
                  _history: [],
                })
                .then(function(docRef) {
                  console.log('Document written with ID: ', docRef.id);
                })
                .catch(function(error) {
                  console.error('Error adding document: ', error);
                });
            });
        });
    },
  };
};
