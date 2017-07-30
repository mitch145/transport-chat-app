// Vendor Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiai = require('apiai');
require('dotenv').config()
const firebase = require('firebase');

var config = {
  apiKey: process.env.FB_API_KEY,
  databaseURL: process.env.FB_DB_URL,
  projectId: process.env.FB_PID,
};
firebase.initializeApp(config);
var db = firebase.database();

const facebookChat = require('./facebook-chat');
const translate = require('./translate');
const maps = require('./maps');

const apiAIApp = apiai(process.env.API_AI_CLIENT_TOKEN);
const app = express();
app.use(bodyParser.json());

// Ping Server
app.get('/', (req, res) => (res.send('Hello World')));

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
      // Iterate over each messaging event
      entry.messaging.forEach((event) => {
        console.log('event123', event)
        if (event.message) {
          if (event.message.text) {
            receivedMessage(event);
          } else if (event.message.attachments) {
            receivedLocation(event);
          } else {
            console.log("Webhook received unknown event: ", event);
          }
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });
    res.sendStatus(200);
  }
});


const receivedMessage = (event) => {
  console.log("New message", event)
  const senderID = event.sender.id;
  // const message = event.message;
  const messageText = event.message.text;
  console.log("Incoming (NAT)", messageText)

  let text, lang;

  translate.translate(messageText).then((data) => {
    text = data.text;
    console.log("Incoming (ENG)", text)
    lang = data.lang;

    console.log("pre request")
    let request = apiAIApp.textRequest(text, {
      sessionId: senderID
    });
    console.log("post request")

    request.on('response', (response) => {
      console.log('LOOK_HERE', response.result)
      if (response.result.action === 'location.send' && response.result.parameters.commgames_location) {
        facebookChat.callSendApi(senderID, "Please send your location")
        db.ref('user/' + "nooooo").set({
          target: response.result.parameters.commgames_location
        });
      } else {
        console.log("Outgoing (ENG)", response.result.fulfillment.speech)
        translate.translate(response.result.fulfillment.speech, lang).then((data) => {
          console.log("Outgoing (NAT)", text)
          facebookChat.callSendApi(senderID, data.text)
        })
      }
    });

    request.on('error', (error) => {
      console.log('APIAI Response Error', error);
    });

    request.end();
  })
}

const receivedLocation = (event) => {
  console.log(event.message.attachments[0].payload.coordinates.lat, event.message.attachments[0].payload.coordinates.long)
}


app.listen(process.env.PORT || 8080);
console.log("The server is now running on port 8080.");
