//built-in
const path = require("path");
// const fs = require('fs').promises;

//fastify
const fastify = require("fastify")({
  logger: false,
});
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/"
});

//socket.io
var io = require("socket.io")(fastify.server, {
  pingInterval: 1000,
  pingTimeout: 3000
});

//socket.io events
io.on("connection", function(socket) {

  //connection notify
  console.log("someone connected.");
  socket.on("disconnect", function() { console.log("someone disconnected."); });

  //on 'button'
  socket.on('button', function(button) {

    // //NOTE: option (1) - relay the message to everybody INCLUDING sender
    // io.emit('button', button);

    //NOTE: option (2) - relay the message to everybody EXCEPT sender
    socket.broadcast.emit('button', button);

    //DEBUG
    console.log('button.id :' + button.id);       // 'id' should be a numeric!
    console.log('button.name :' + button.name);   // 'name' is a string.
    //DEBUG
    console.log('button.value :' + button.value); // 'value' should be a numeric!: 1 or 0
    console.log('button.state :' + button.state); // 'state' is a string: 'on', or 'off'
  })

  //on 'osc-msg'
  socket.on('osc-msg', function(msg) {
    console.log(msg);
    socket.broadcast.emit('osc-msg', msg);
  })

});

//listen
var port = process.env.PORT || 8080;
fastify.listen(port, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Your app is listening on ${address}`)
  fastify.log.info(`server listening on ${address}`)
});
