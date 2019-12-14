import download from 'downloadjs';

export default function createAdspl() {
  return {
    checkEntry(body, user) {
      return user._authUser.getIdToken(true).then(function(idToken) {
        return fetch(process.env.CRM_API_URL + '/adspl/check-entry', {
          headers: {
            authorization: `Bearer ${idToken}`,
          },
          method: 'POST',
          body: JSON.stringify(body),
        })
          .then(res => {
            if (res.ok) {
              return res.text();
            }
            throw new Error(res.statusText);
          })
          .catch(err => {
            console.error(err);
            throw err;
          });
      });
    },
    activateEmail(id, email, user) {
      return user._authUser.getIdToken(true).then(function(idToken) {
        return fetch(process.env.CRM_API_URL + '/adspl/activate-email', {
          headers: {
            authorization: `Bearer ${idToken}`,
          },
          method: 'POST',
          body: JSON.stringify({ id, email }),
        })
          .then(res => {
            if (res.ok) {
              return res.text();
            }
            throw new Error(res.statusText);
          })
          .catch(err => {
            console.error(err);
            throw err;
          });
      });
    },
    downloadExtract(year, user) {
      return user._authUser.getIdToken(true).then(function(idToken) {
        return fetch(process.env.CRM_API_URL + '/adspl/extract/' + year, {
          headers: {
            authorization: `Bearer ${idToken}`,
            'Content-Type': 'text/plain',
          },
        })
          .then(res => {
            if (res.ok) {
              return res.text();
            }
            throw new Error(res.statusText);
          })
          .then(blob => {
            download(blob, 'extract.csv');
          })
          .catch(err => {
            console.error(err);
            throw err;
          });
      });
    },
    getDetails(id, user) {
      return user._authUser.getIdToken(true).then(function(idToken) {
        return fetch(process.env.CRM_API_URL + '/adspl/details/' + id, {
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
    updateInfos(id, infos, user) {
      return user._authUser.getIdToken(true).then(function(idToken) {
        return fetch(process.env.CRM_API_URL + '/adspl/infos/' + id, {
          method: 'post',
          headers: {
            authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(infos),
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
