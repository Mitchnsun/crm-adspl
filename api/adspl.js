const moment = require('moment');
const { merge, get } = require('lodash');
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

function toCSVLineSiret(year, key, value) {
  return [value.siren, value.siret, value.email].join(';') + '\n';
}

function checkEntry({ cotisation: year, id, amount, checkNumber }, userId) {
  const data = {
    date: moment().toISOString(),
    id,
    amount,
    checkNumber,
    agentId: userId,
  };

  const root = id.length === 9 ? `sirens` : `ids`;

  const logEvent = () => {
    return crm
      .database()
      .ref('/activities/' + userId + '/' + moment().format('DD_MM_YYYY'))
      .push({
        scope: 'adspl',
        date: data.date,
        task: 'check-entry',
        input: data,
        by: userId,
        adsplId: id,
      })
      .then(() => {
        return adspl
          .database()
          .ref(`${root}/${id}/_history`)
          .push({
            date: data.date,
            task: 'check-entry',
            input: {
              date: data.date,
              amount,
              checkNumber,
            },
            by: userId,
          });
      });
  };

  return adspl
    .database()
    .ref(`${root}/${id}/cotisations/${year}/PAYMENT/CHECK`)
    .set(data)
    .then(logEvent);
}

module.exports = {
  getById,
  updateInfos,
  checkEntry,
};
