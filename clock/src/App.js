import React from 'react';
import axios from 'axios';
import Websocket from 'react-websocket';

const NGROK_BASE = '5a3bfd58.ngrok.io'; 
const NGROK = 'http://' + NGROK_BASE;
const NGROK_WS = 'ws://' + NGROK_BASE;

const logVals = {
  'logglyKey': 'a8581f69-9107-4b45-b88d-c5ae1e935974',
  'sendConsoleErrors' : true,
  'tag' : 'log-all-things-clock' ,
  'subdomain' : 'logallthings'
}
const logger = {
  log: (message) => {
    axios.get('http://logs-01.loggly.com/inputs/' + logVals.logglyKey + '.gif?message=' + message + '&tag=' + logVals.tag);
  }
};

const log = (string) => {
  console.log(string);
  logger.log(string);
}

const logRequest = (string, response) => {
  log(string);
  log(response);
}

class Time extends React.Component {
  constructor(props) {
    super(props);
    let client = new WebSocket(NGROK_WS);
    let timewarp = 0;
    this.state = {time: '10:00:00'};
    this.state.outer= {
      width: '100%',
      height: '100%',
      backgroundColor: 'green'
    }
    this.state.style = {
      color: 'black',
      fontSize: '20vw',
      padding: '20vw 20vh',
      fontFamily: '"Open 24 Display St", Helvetica, Serif'
    }
    let serverInterval = setInterval(() => {
      axios.get(NGROK + '/time').then((response) => {
        logRequest(NGROK + '/time response', response);
        timewarp = 0;
        this.setState({time: response.data});
        const keepalive = {message:'keepalive'};
        log('Sending server websocket keepalive ' + keepalive);
        client.send(keepalive);
      });
    },10000);
    let secondInterval = setInterval(() => {
      let newTime = this.state.time.split(':');
      newTime[2] ++;
      newTime[0] = parseInt(newTime[0]) + timewarp;
      timewarp = 0;
      this.setState({time: newTime[0] + ':' + newTime[1] + ':' + newTime[2]});
    },1000);
    client.onerror = function() {
      log('Websocket error');
    }
    client.onclose = function() {
      let client = new WebSocket(NGROK_WS);
      log('Websocket closed');
    }
    client.onopen= function() {
      log('Websocket opened');
    }
    let time = this;
    client.onmessage= function(message) {
      log('Websocket message!');
      log(message.data);
      let ws_message = JSON.parse(message.data);
      if(ws_message.color) {
        time.setState({outer: {
          backgroundColor:ws_message.color,
          width: '100%',
          height: '100%'
        }});
      }
      else if(ws_message.mode) {
        timewarp--;
      }
    }
  }

  handleData(data) {
    let result = JSON.parse(data);
    log('Websocket message delivered!');
    log(data);
  }

  render() {
    return <div style={this.state.outer}>
            <div style={this.state.style}>
               {this.state.time}
             </div>
           </div>
  }
}

const App = (props) => {
  let style = {
    width: '100%',
    height: '100%',
    verticalAlign: 'middle'
  };
  return <div style={style}>
           <Time/>
         </div>
}

export default App;
