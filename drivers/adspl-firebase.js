export default function createAdspl() {
  return {
    getDetails(id, user) {
      return user._authUser.getIdToken(true).then(function(idToken) {
        return fetch('http://localhost:5001/adspl-crm-test/us-central1/app/adspl/' + id, {
          headers: {
            authorization: `Bearer ${idToken}`,
          },
        })
          .then(res => {
            console.log('TEST', res);
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
  };
}
