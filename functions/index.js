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

const functions = require('firebase-functions');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser')();
const { crm } = require('./connections');

const cors = require('cors')({ origin: true, credentials: true });
const app = express();
const adspl = require('./adspl');

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res, next) => {
  console.log('Check if request is authorized with Firebase ID token');

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
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const decodedIdToken = await crm.auth().verifyIdToken(idToken);
    console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
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
  const { firstname, lastname, email, isActive, id, role } = JSON.parse(req.body);

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
});

app.get('/googlea878fa7e95ce857c.html', (req, res) => {
  fs.createReadStream('./googlea878fa7e95ce857c.html').pipe(res);
});

app.post('/onEmail', (req, res) => {
  console.log(req.body);
  res.status(204).send('');
});

app.get('/adspl/:id', validateFirebaseIdToken, checkUser(['admin', 'agent']), async (req, res) => {
  const data = await adspl.getById(req.params.id);
  res.json(data);
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

app.post('/email', validateFirebaseIdToken, checkUser(['admin', 'agent']), async (req, res) => {
  try {
    await gmailApi.sendMessage(JSON.parse(req.body));
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
    return;
  }
  res.send();
});

// This HTTPS endpoint can only be accessed by your Firebase Users.
// Requests need to be authorized by providing an `Authorization` HTTP header
// with value `Bearer <Firebase ID Token>`.
exports.app = functions.https.onRequest(app);
