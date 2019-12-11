import download from 'downloadjs';

export default function createAdspl() {
  return {
    downloadExtract(year, user) {
      return user._authUser.getIdToken(true).then(function(idToken) {
        return fetch(process.env.CRM_API_URL + '/adspl/extract?year=' + year, {
          headers: {
            authorization: `Bearer ${idToken}`,
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
          });
      });
    },
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
