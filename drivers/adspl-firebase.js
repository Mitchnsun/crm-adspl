export default function createAdspl() {
  return {
    getDetails(id, user) {
      return user._authUser.getIdToken(true).then(function(idToken) {
        return fetch(process.env.CRM_API_URL + '/adspl/' + id, {
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
  };
}
