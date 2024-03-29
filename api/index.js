/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser')();

const { crm } = require('./connections');

const corsOptions = {
  origin: true,
  credentials: true,
};
const cors = require('cors')(corsOptions);
const app = express();
const adspl = require('./adspl');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res, next) => {
  if (
    (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.',
    );
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const decodedIdToken = await crm.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    res.status(403).send('Unauthorized');
    return;
  }
};

function checkUser(roles = []) {
  return async (req, res, next) => {
    const userId = req.user.uid;
    const user = await crm
      .database()
      .ref('users/' + userId)
      .once('value')
      .then(snap => snap.val());
    if (!user || !user.isActive || !roles.includes(user.role)) {
      console.error('Invalid user', user, roles);
      res.status(403).send('Unauthorized');
      return;
    }
    next();
  };
}

app.use(cors);
app.use(cookieParser);

app.get('/ping', (req, res) => {
  res.send(`pong`);
});

app.post('/createAccount', async (req, res, next) => {
  try {
    const { firstname, lastname, email, isActive, id, role } = req.body;

    if (!id) {
      console.error(typeof req.body, req.body);
      res.status(400).send('Wrong id!');
      return;
    }

    const user = await crm
      .database()
      .ref('users/' + id)
      .once('value')
      .then(snap => snap.val());

    if (user) {
      res.status(400).send('User allready exist!');
      return;
    }
    await crm
      .database()
      .ref('users/' + id)
      .set({
        firstname,
        lastname,
        email,
        isActive,
        id,
        role,
      });

    res.status(204).send('');
  } catch (e) {
    console.error(e, typeof req.body, req.body);
    res.status(500).send('');
  }
});

app.get('/google2ad894dd3053feaa.html', (req, res) => {
  fs.createReadStream('./google2ad894dd3053feaa.html').pipe(res);
});

const { downloadExtract } = require('./adspl.extract');
app.get('/adspl/extract/:year', validateFirebaseIdToken, checkUser(['admin']), (req, res) => {
  const { year } = req.params;

  if (!year) {
    res.status(400).send('No year provided!');
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv');
  downloadExtract(year, data => res.write(data), () => res.end(), () => res.status(500).send());
});

app.get('/adspl/details/:id', validateFirebaseIdToken, checkUser(['admin', 'agent']), async (req, res) => {
  const data = await adspl.getById(req.params.id);
  res.json(data);
});

app.post('/adspl/check-entry', validateFirebaseIdToken, checkUser(['admin', 'agent']), (req, res) => {
  const body = JSON.parse(req.body);
  adspl
    .checkEntry(body, req.user.uid)
    .then(() => {
      res.send('');
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('');
    });
});

const { updateVerifiedEmail, deleteAccount } = require('./users');
app.post('/adspl/activate-email', validateFirebaseIdToken, checkUser(['admin', 'agent']), (req, res) => {
  const { id, email } = JSON.parse(req.body);
  updateVerifiedEmail(
    {
      userEmail: email,
      userSiren: id,
    },
    req.user.uid,
  )
    .then(() => {
      res.send('');
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('');
    });
});

app.post('/adspl/delete-account', validateFirebaseIdToken, checkUser(['admin', 'agent']), (req, res) => {
  const { email } = JSON.parse(req.body);
  deleteAccount(
    {
      email,
    },
    req.user.uid,
  )
    .then(() => {
      res.send('');
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('');
    });
});

app.post('/adspl/infos/:id', validateFirebaseIdToken, checkUser(['admin', 'agent']), async (req, res) => {
  try {
    await adspl.updateInfos(req.params.id, JSON.parse(req.body), req.user.uid);
    res.json({
      ok: true,
    });
  } catch (e) {
    console.error(e);
    res.json({
      ok: false,
      err: e,
    });
  }
});

const gmailApi = require('./gmail')();
app.get('/email/:id', validateFirebaseIdToken, checkUser(['admin', 'agent']), async (req, res) => {
  const data = await gmailApi.getById(req.params.id);
  res.json(data);
});

const mail = require('./mail-mailjet');
app.post('/email', validateFirebaseIdToken, checkUser(['admin', 'agent']), async (req, res) => {
  try {
    console.log('/email request', typeof req.body, req.body);
    const response = await mail.sendMessage(req.body);
    console.log('/email response', JSON.stringify(response));
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
    return;
  }
  res.send();
});

const { onReceiveGmailEmail } = require('./crm')(crm);
let inProgress = false;
app.post('/onEmail', async (req, res) => {
  if (inProgress) {
    res.status(204).send('');
    return;
  }
  inProgress = true;
  try {
    const more = await gmailApi.addNewTicket(onReceiveGmailEmail);
    inProgress = false;
    if (more) {
      return res.status(449).send('');
    }
    return res.status(204).send('');
  } catch (e) {
    inProgress = false;
    console.error(e, req.body, req.query, req.headers);
    return res.status(500).send('');
  }
});

const port = process.env.PORT || 8888;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  // eslint-disable-next-line
  console.log(`Server running on port ${host}:${port}`);
});
