const oboe = require('oboe');
const config = require('./env-config.json');
const { adspl } = require('./connections');
const { get } = require('lodash');
const { google } = require('googleapis');

// Load the service account key JSON file.
const serviceAccount = require('./credentials-adspl.json');

function getAccessToken() {
  // Define the required scopes.
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/firebase.database',
  ];

  // Authenticate a JWT client with the service account.
  const jwtClient = new google.auth.JWT(serviceAccount.client_email, null, serviceAccount.private_key, scopes);

  return new Promise((resolve, reject) => {
    // Use the JWT client to generate an access token.
    jwtClient.authorize(function(error, tokens) {
      if (error) {
        reject(error);
      } else if (tokens.access_token === null) {
        reject(new Error('Provided service account does not have permission to generate access tokens'));
      } else {
        resolve(tokens.access_token);
      }
    });
  });
}

const { createMapSiren, mapSiret } = require('./dbSirens.utils');

function downloadExtract(year, onData, onEnd, onError) {
  if ('' + year === '2018') {
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

    const map = createMapSiren({
      getCurrentCotisation: () => year,
      getPreviousCotisation: () => year + '2',
    });

    return adspl
      .database()
      .ref(`users`)
      .once('value')
      .then(snap => snap.val())
      .then(users => {
        return getAccessToken()
          .then(token => {
            onData(paths.join(';') + '\n');
            return oboe({
              url: config.adsplDatabaseUrl + '/sirens.json?access_token=' + token,
            })
              .node('!.*', function(siren) {
                const formattedValues = map(siren, { email: true }, users);
                onData(toLine(formattedValues));

                // By returning oboe.drop, the parsed JSON object will be freed,
                // allowing it to be garbage collected.
                return oboe.drop;
              })
              .done(() => {
                onEnd();
              })
              .fail(err => {
                console.error(err);
                onError();
              });
          })
          .catch(onError);
      });
  }

  const paths = [
    'siret',
    'siren',
    'enterprise.name',
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
  ];

  function toLine(obj) {
    const values = paths.map(p => get(obj, p, ''));
    return `${values.join(';')}\n`;
  }

  return adspl
    .database()
    .ref(`users`)
    .once('value')
    .then(snap => snap.val())
    .then(users => {
      return getAccessToken()
        .then(token => {
          onData(paths.join(';') + '\n');
          return oboe({
            url: config.adsplDatabaseUrl + '/ids.json?access_token=' + token,
          })
            .node('!.*', function(siretDatas, siret) {
              const formattedValues = mapSiret(siret, year, siretDatas, { email: true }, users);
              onData(toLine(formattedValues));

              // By returning oboe.drop, the parsed JSON object will be freed,
              // allowing it to be garbage collected.
              return oboe.drop;
            })
            .done(() => {
              onEnd();
            })
            .fail(err => {
              console.error(err);
              onError();
            });
        })
        .catch(onError);
    });
}

module.exports = {
  downloadExtract,
};
