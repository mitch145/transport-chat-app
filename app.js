// Vendor Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiai = require('apiai');
require('dotenv').config()


// Custom Dependencies
const facebookChat = require('./facebook-chat');
const translate = require('./translate');

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

app.post('/translate', (req,res) => {
  res.write("hello \n")
  res.write("query")
  // Encode
  translate.translate("bonjour").then((data) => {
    console.log(data.text, data.lang)
  })

  // Decode
  // let ret = translate.translate(req, res, "hello", "fr")
  // console.log(ret.text)
  res.end()
})

app.post('/maps', (req,res) => {
  res.write("hello \n")
  res.write("query")
  // Encode
  maps.findroute().then((data) => {
    console.log(data)
  })

  // Decode
  // let ret = translate.translate(req, res, "hello", "fr")
  // console.log(ret.text)
  res.end()
})

const receivedMessage = (event) => {
  console.log("New message", event)
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfMessage = event.timestamp;
  const message = event.message;

  const messageId = message.mid;

  const messageText = message.text;
  console.log("Incoming (NAT)", messageText)

  let text, lang;

  translate.translate(messageText).then((data) => {
    text = data.text;
    console.log("Incoming (ENG)", text)
    lang = data.lang;

    let request = apiAIApp.textRequest(text, {
      sessionId: senderID
    });

    request.on('response', (response) => {
      console.log(response.result.fulfillment.speech);
      console.log("Outgoing (ENG)", response.result.fulfillment.speech)
      translate.translate(response.result.fulfillment.speech, lang).then((data) => {
      console.log("Outgoing (NAT)", text)
        facebookChat.callSendApi(senderID, data.text)
      })


    });

    request.on('error', (error) => {
      console.log(error);
    });

    request.end();
  })






}


app.listen(process.env.PORT || 8080);
console.log("The server is now running on port 8080.");
