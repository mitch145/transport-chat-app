// Vendor Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rp = require('request-promise');
const apiai = require('apiai');

// Custom Dependencies
const apiAIApp = apiai(process.env.API_AI_CLIENT_TOKEN);

const app = express();
app.use(bodyParser.json());

// Ping Server
app.get('/', (req, res) => (res.send('Hello World')))

app.get('/v0/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === 'thisisatoken') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.post('/v0/webhook', (req, res) => {
  const data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach((entry) => {
      const pageID = entry.id;
      const timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach((event) => {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });
    res.sendStatus(200);
  }
});

const receivedMessage = (event) => {
  console.log(event)
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;

  const messageId = message.mid;

  const messageText = message.text;
  console.log("Received message: ", messageText)

  let request = apiAIApp.textRequest(messageText, {
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