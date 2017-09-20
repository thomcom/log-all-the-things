
/**************************************
 * Express Setup
  *************************************/
const express = require('express');
const app = express();

/**************************************
 * Logging
  *************************************/

var loggly = require('loggly');

var client = loggly.createClient({
  token: "a8581f69-9107-4b45-b88d-c5ae1e935974",
  subdomain: "logallthings",
  //auth: {
  //  username: "your-username",
  //  password: "your-password"
  //},
  //
  // Optional: Tag to send with EVERY log message
  //
  tags: ['logallthings-demo-server'],
  json:true
});

/**************************************
 * Server!
  *************************************/

const port = 8081;
const server = app.listen(port, () => {
  client.log('server online!');
});

app.get('/time', (request, response) => {
  response.send('time');  
});

app.post('/change_color', (request, response) => {
});

app.post('/toggle_mode', (request, response) => {
});
