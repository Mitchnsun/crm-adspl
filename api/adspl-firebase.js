const fetch = require('node-fetch');

//const ADSPL_API = 'https://syndic-my-pro.herokuapp.com/api/';
const ADSPL_API = 'http://localhost:8080/api/';
// const ADSPL_API = 'https://www.adspl.fr/api/siren';

module.exports = {
  get(id) {
    return fetch(ADSPL_API + 'siren/' + id + '/details')
      .then(res => {
        return res.json();
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  },
};
