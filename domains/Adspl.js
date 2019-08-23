export default function createAdspl(drivers) {
  const isAdsplRole = user => {
    return ['agent-adspl', 'admin'].includes(user.role);
  };

  return {
    isAdsplRole,
    getDetails(siren, user) {
      if (isAdsplRole(user)) {
        return drivers.adspl.getDetails(siren);
      }
      return Promise.reject(new Error('Forbidden'));
    },
    validateId(siren) {
      return (siren && siren.length > 0) || false;
    },
  };
}
