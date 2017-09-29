/**************************************
 * Express Setup
  *************************************/
const cors = require('cors');
const express = require('express');
const ws = require('ws');
const app = express();
app.use(cors());


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

const log = (string, data = {}) => {
  string ? data.message = string : '';
  client.log(data);
  console.log(data);
}

const logRequest = (string, data = {}) => {
  data.request = string;
}

/**************************************
 * State
  *************************************/
let color = 'green';
let mode = 'MDT';

/**************************************
 * Server!
  *************************************/

const port = 8081;
const _server = app.listen(port, () => {
  log('server online!');
  log('port 8081');
});

app.get('/time', (request, response) => {
  logRequest('/time');
  const date = new Date();
  let value = undefined;
  value = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
  log('Server side Date() is ' + date);
  log('Server side time is ' + value);
  response.send(value); 
});

var _ws = undefined;
app.post('/change_color', (request, response) => {
  logRequest('/change_color');
  color === 'green' ? color = 'red' : color = 'green';
  log('Changing color to ' + color);
  response.send('ok'); 
  // websocket push color change
  _ws.send('{"color":"' + color + '"}');
});

app.post('/toggle_mode', (request, response) => {
  logRequest('/toggle_mode');
  log('Changing timezone to ' + mode);
  response.send('ok'); 
  // websocket push mode_change
  _ws.send('{"mode":"' + mode + '"}');
});

/**************************************
 * WebSocketServer!
  *************************************/
var WebSocketServer = ws.Server;
var _wss = new WebSocketServer({ server : _server })

_wss.on('connection', function connection(socket) {
  _ws = socket;
  _ws.on('message', function incoming(message) {
    log('WebSocket server received message');
    log(JSON.stringify(message));
  });
  _ws.on('data', function(data) {
    log('WebSocket server got data!');
    log(data);
  });
  _ws.on('close', function() {
    log('WebSocket server closed!');
  });
  console.log('WebSocket server closed!');
});
