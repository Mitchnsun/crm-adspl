const admin = require('firebase-admin');
const firstServiceAccount = require('./credentials-crm.json');
const secondServiceAccount = require('./credentials-adspl.json');
const config = require('./env-config.json');

const _first = admin.initializeApp(
  {
    credential: admin.credential.cert(firstServiceAccount),
    databaseURL: config.crmDatabaseUrl,
  },
  'crm', // this name will be used to retrieve firebase instance. E.g. crm.database();
);

const _second = admin.initializeApp(
  {
    credential: admin.credential.cert(secondServiceAccount),
    databaseURL: config.adsplDatabaseUrl,
  },
  'adspl', // this name will be used to retrieve firebase instance. E.g. adspl.database();
);

module.exports = {
  crm: _first,
  adspl: _second,
};
