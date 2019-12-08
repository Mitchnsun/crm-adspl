const moment = require('moment');
const { merge } = require('lodash');
const { adspl, crm } = require('./connections');
const { mapSiren, mapSiret } = require('./adspl-siren.util');

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
    .then(snap => snap.val())
    .then(mapSiret);
}

function getById(id) {
  if (!id) return Promise.reject(new Error('Invalid id!'));
  if (id.length === 9) return getSirenDetails(id);
  return getSiretDetails(id);
}

function updateInfos(id, infos, userId) {
  return adspl
    .database()
    .ref('/ids/' + id + '/infos')
    .once('value')
    .then(snap => snap.val())
    .then(currentInfos => {
      const date = new Date().toISOString();
      return adspl
        .database()
        .ref('/ids/' + id + '/_history')
        .push({
          date,
          task: 'infos-update',
          input: infos,
          by: userId,
        })
        .then(() => {
          return adspl
            .database()
            .ref('/ids/' + id + '/infos')
            .set(merge(currentInfos || {}, infos))
            .then(() => {
              return crm
                .database()
                .ref('/activities/' + userId + '/' + moment().format('DD_MM_YYYY'))
                .push({
                  scope: 'adspl',
                  date,
                  task: 'infos-update',
                  input: infos,
                  by: userId,
                  adsplId: id,
                });
            });
        });
    });
}

module.exports = {
  getById,
  updateInfos,
};
