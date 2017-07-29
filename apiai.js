const apiai = require('apiai');
const config = require('./config');
 
const app = apiai(process.env.API_AI_CLIENT_TOKEN);

module.exports = {
  app: app,
}