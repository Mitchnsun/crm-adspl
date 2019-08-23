export default function createAdspl() {
  return {
    getDetails(id) {
      return fetch('/_api/adspl/' + id).then(res => (res.ok ? res.json() : Promise.reject(res.statusText)));
    },
  };
}
