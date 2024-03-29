//// cli arg
const args = process.argv.slice(2);
var host = args[0];
if (!host) host = 'http://localhost:8080';
console.log(
  "connecting to the host... : \n" +
  "\t --> " + host + "\n"
);

//// socket.io client
var socket = require('socket.io-client')(host);

//// osc.js configuration (UDP)
var osc = require("osc");

//// NOTE: apps cannot share port.. (pd & sc)

// --> for puredata
//       tx: 57000
//       rx: 57001

var udp_pd = new osc.UDPPort({
  localAddress: '0.0.0.0',
  //NOTE: '127.0.0.1' doesn't work!! for comm. between different machines
  localPort: 57001,
  remoteAddress: '0.0.0.0',
  remotePort: 57000,
  metadata: true
});

// --> for supercollider
//       tx: 57120
//       rx: 57121

var udp_sc = new osc.UDPPort({
  localAddress: '0.0.0.0',
  //NOTE: '127.0.0.1' doesn't work!! for comm. between different machines
  localPort: 57121,
  remoteAddress: '0.0.0.0',
  remotePort: 57120,
  metadata: true
});

//firstly establish/prepare osc conn. - supercollider & puredata
Promise.all([
  new Promise(function(resolve, reject) {
    udp_pd.on("ready", function() {
      resolve(0);
      console.log('udp_pd ready..');
    });
  }),
  // new Promise(function(resolve, reject) {
  //   udp_sc.on("ready", function() {
  //     resolve(0);
  //     console.log('udp_sc ready..');
  //   });
  // }),
]).then(function(results) {

  //
  socket.on('connect', function() {
    console.log("[osc-receiver] i'm connected.");
  });

  //
  socket.on('button', function(button) {

    // //DEBUG
    // console.log('button :');
    // console.log(button);

    //// simply relaying messages to apps.

    // to puredata
    udp_pd.send({
      address: "/button",
      args: [{
        type: "f",
        value: button.id
      }, {
        type: "f",
        value: button.value
      }]
    });

    // // to supercollider
    // udp_sc.send({
    //   address: "/button",
    //   args: [{
    //     type: "f",
    //     value: button.id
    //   }, {
    //     type: "f",
    //     value: button.value
    //   }]
    // });

  });

  //
  socket.on('disconnect', function() {
    console.log("[osc-receiver] i'm disconnected.");
  });

});

//message handler
udp_pd.on("message", function(oscmsg, timetag, info) {
  console.log("[udp] got osc message:", oscmsg);

  //EX)
  //method [1] : just relay as a whole
  socket.emit('osc-msg', oscmsg); //broadcast

  //EX)
  // //method [2] : each fields
  // io.emit('osc-address', oscmsg.address); //broadcast
  // io.emit('osc-type', oscmsg.type); //broadcast
  // io.emit('osc-args', oscmsg.args); //broadcast
  // io.emit('osc-value0', oscmsg.args[0].value); //broadcast

  // //just grab i need.. note!
  // io.emit('sing-note', oscmsg.address); //broadcast
});

//osc.js - start service
udp_pd.open();
udp_pd.on("ready", function() {
  console.log(
    "[udp] ready (udp_pd) : \n" +
    "\tlistening on --> " + udp_pd.options.localAddress + ":" + udp_pd.options.localPort + "\n" +
    "\tspeaking to -> " + udp_pd.options.remoteAddress + ":" + udp_pd.options.remotePort + "\n"
  );
});
udp_sc.open();
udp_sc.on("ready", function() {
  console.log(
    "[udp] ready (udp_sc) : \n" +
    "\tlistening on --> " + udp_sc.options.localAddress + ":" + udp_sc.options.localPort + "\n" +
    "\tspeaking to -> " + udp_sc.options.remoteAddress + ":" + udp_sc.options.remotePort + "\n"
  );
});
