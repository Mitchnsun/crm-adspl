require('dotenv').config();

const express = require('express');
const next = require('next');

const adspl = require('./api/adspl-firebase');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.get('/t/:id', (req, res) => {
      const actualPage = '/ticket';
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
    });

    server.get('/_api/adspl/:id', (req, res) => {
      const { id } = req.params;

      adspl
        .get(id)
        .then(result => res.json(result))
        .catch(err => res.status(500).send(err.message));
    });

    server.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, err => {
      if (err) throw err;
      console.log('> Ready on http://localhost:3000');
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
