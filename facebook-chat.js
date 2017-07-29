// Vendor Dependencies
const rp = require('request-promise');

const callSendApi = messageData => {
  rp({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: process.env.PAGE_ACCESS_TOKEN
    },
    method: 'POST',
    json: messageData

  })
    .catch((error) => (console.error(error)))
}

module.exports = {
  callSendApi: callSendApi,
} 