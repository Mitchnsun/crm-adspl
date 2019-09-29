const { adspl } = require('./connections');
const { mapSiren } = require('./adspl-siren.util');

function getSirenDetails(siren) {
  return adspl
    .database()
    .ref('/sirens/' + siren)
    .once('value')
    .then(snap => snap.val())
    .then(mapSiren);
}

function getSiretDetails(siret) {
  return adspl
    .database()
    .ref('/ids/' + siret)
    .once('value')
    .then(snap => snap.val());
}

function getById(id) {
  if (!id) return Promise.reject(new Error('Invalid id!'));
  if (id.length === 9) return getSirenDetails(id);
  return getSiretDetails(id);
}

module.exports = {
  getById,
};
