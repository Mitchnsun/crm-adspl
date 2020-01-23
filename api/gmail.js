const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getGmail() {
  return new Promise((resolve, reject) => {
    // Load client secrets from a local file.
    fs.readFile('credentials-gmail.json', (err, content) => {
      if (err) {
        reject(err);
        return console.log('Error loading client secret file:', err);
      }
      // Authorize a client with credentials, then call the Gmail API.
      authorize(JSON.parse(content), auth => {
        const gmail = google.gmail({ version: 'v1', auth });
        resolve(gmail);
      });
    });
  });
}

const CRM_TICKET_CREATED = 'Label_136'; // Id on GMAIL

module.exports = function() {
  return {
    getMessageIds() {
      return getGmail().then(gmail => {
        return gmail.users.messages
          .list({
            userId: 'me',
            q: '',
            labelIds: ['INBOX', 'UNREAD'],
            maxResults: 5,
          })
          .then(value => {
            return (value.data.messages || []).map(m => m.id);
          });
      });
    },
    async createBatches(messageIds, onReceiveGmailEmail, updateLabels, getById, currentlabelId) {
      await updateLabels(messageIds, currentlabelId);
      for (const id of messageIds) {
        const response = await getById(id);
        await onReceiveGmailEmail(response.data, currentlabelId);
      }
    },
    async addNewTicket(onReceiveGmailEmail) {
      const messageIds = await this.getMessageIds();
      if (messageIds.length === 0) return false;
      await this.createBatches(messageIds, onReceiveGmailEmail, this.updateLabels, this.getById);
      return true;
    },
    updateLabels(ids, currentlabelId) {
      return getGmail().then(gmail =>
        gmail.users.messages.batchModify({
          userId: 'me',
          requestBody: {
            ids,
            addLabelIds: [CRM_TICKET_CREATED, currentlabelId],
            removeLabelIds: ['UNREAD'],
          },
        }),
      );
    },
    getById(id) {
      return getGmail().then(gmail =>
        gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'full',
        }),
      );
    },
    sendMessage({ message, to }) {
      return getGmail().then(gmail =>
        gmail.users.messages.send({
          userId: to,
          resource: {
            raw: Buffer.from(unescape(encodeURIComponent(message))).toString('base64'),
          },
        }),
      );
    },
  };
};
