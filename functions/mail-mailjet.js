const mailjet = require('node-mailjet');

const sender = mailjet.connect('f376452486b0a46ed2638a695157f882', 'b3e5e0533f6c06427214875e45475144');

module.exports = {
  sendMessage({ from, to, subject, message }) {
    const request = sender.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: from.email,
            Name: from.name,
          },
          To: [
            {
              Email: to.email,
              Name: to.name,
            },
          ],
          Subject: subject,
          TextPart: message,
        },
      ],
    });

    return request
      .then(result => result.body)
      .catch(err => {
        /* eslint-disable no-console */
        console.error('mailjet fail to send contact email', { sender, subject });
        console.error('mailjet fail with statusCode', err);
        /* eslint-enable no-console */
        throw err;
      });
  },
};
