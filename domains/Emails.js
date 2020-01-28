export default function createEmails() {
  return {
    getById(id, user) {
      return user._authUser.getIdToken(true).then(function(idToken) {
        return fetch(process.env.CRM_API_URL + '/email/' + id, {
          headers: {
            authorization: `Bearer ${idToken}`,
          },
        })
          .then(res => {
            if (res.ok) {
              return res.json();
            }
            throw new Error(res.statusText);
          })
          .catch(err => {
            console.error(err);
          });
      });
    },
    sendEmail(body, user) {
      return user._authUser.getIdToken(true).then(function(idToken) {
        return fetch(process.env.CRM_API_URL + '/email', {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${idToken}`,
          },
          method: 'POST',
          body: JSON.stringify(body),
        })
          .then(res => {
            console.log('email sent');
            if (res.ok) {
              return;
            }
            throw new Error(res.statusText);
          })
          .catch(err => {
            console.error(err);
          });
      });
    },
  };
}
