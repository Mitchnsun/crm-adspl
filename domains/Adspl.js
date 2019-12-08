export default function createAdspl(drivers) {
  return {
    getDetails(siren, user) {
      return drivers.adspl.getDetails(siren, user);
    },
    validateId(siren) {
      return (siren && siren.length > 0) || false;
    },
    updateInfos(id, datas, user) {
      return drivers.adspl.updateInfos(id, datas, user);
    },
  };
}
