// Vendor Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rp = require('request-promise');
const config = require('./config');

// Custom Dependencies
const helpers = require('./helpers');
// const apiai = require('./apiai')

const app = express();
app.use(bodyParser.json());

// Ping Server
app.get('/', (req, res) => (res.send('Hello World')))

const receivedMessage = (event) => {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;

  const messageId = message.mid;

  const messageText = message.text;

  callSendAPI({
    recipient: {
      id: senderId
    },
    message: {
      text: messageText
    },
  })

  let request = apiai.textRequest(messageText, {
    sessionId: senderID
  });

  request.on('response', (response) => {
    console.log(response);
  });

  request.on('error', (error) => {
    console.log(error);
  });

  request.end();
}


// Call Facebook send API
const callSendAPI = messageData => {
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

app.listen(process.env.PORT || 8080);
console.log("The server is now running on port 8080.");