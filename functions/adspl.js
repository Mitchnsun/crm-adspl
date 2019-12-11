const moment = require('moment');
const { merge, get } = require('lodash');
const { adspl, crm } = require('./connections');
const { mapSiren, mapSiret } = require('./adspl-siren.util');
const { createMapSiren } = require('./dbSirens.utils');

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

const paths = [
  'siren',
  'enterprise.name',
  'enterprise.APECOD2008',
  'enterprise.APEM',
  'enterprise.APET700',
  'cotisation.accountantSiren',
  'cotisation.status',
  'cotisation.amount',
  'cotisation.registrationDate',
  'cotisation.payroll',
  'cotisation.numberOfEmployees',
  'cotisation.email',
  'cotisation.payment.status',
  'cotisation.payment.type',
  'cotisation.payment.date',
  'cotisation2.accountantSiren',
  'cotisation2.status',
  'cotisation2.amount',
  'cotisation2.registrationDate',
  'cotisation2.payroll',
  'cotisation2.numberOfEmployees',
  'cotisation2.email',
  'cotisation2.payment.status',
  'cotisation2.payment.type',
  'cotisation2.payment.date',
];

function toLine(obj) {
  const values = paths.map(p => get(obj, p, ''));
  return `${values.join(';')}\n`;
}

function downloadExtract(year, onData, onEnd) {
  const map = createMapSiren({
    getCurrentCotisation: () => year,
    getPreviousCotisation: () => year + '2',
  });

  Promise.all([
    adspl
      .database()
      .ref('/ids')
      .once('value')
      .then(snap => snap.val()),
    adspl
      .database()
      .ref('/sirens')
      .once('value')
      .then(snap => snap.val()),
    adspl
      .database()
      .ref(`users`)
      .once('value')
      .then(snap => snap.val()),
  ])
    .then(([sirets, sirens, users]) => {
      onData(paths.join(';') + '\n');
      /*   Object.entries(sirets).forEach(([key, value]) => {
        onData(toCSVLineSiret(year, key, value));
      });
*/
      Object.entries(sirens).forEach(([key, value]) => {
        const formattedValues = map(value, { email: true }, users);
        onData(toLine(formattedValues));
      });

      onEnd();
    })
    .catch(err => {
      console.error(err);
      onEnd();
    });
}

module.exports = {
  getById,
  updateInfos,
  downloadExtract,
};
