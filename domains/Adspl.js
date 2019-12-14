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
    downloadExtract(year, user) {
      return drivers.adspl.downloadExtract(year, user);
    },
    activateEmail(id, email, user) {
      return drivers.adspl.activateEmail(id, email, user);
    },
    checkEntry(params, user) {
      return drivers.adspl.checkEntry(params, user);
    },
  };
}
