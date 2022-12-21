// a paperscript (paperjs)

function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function() {

  //common metrics
  var vs = view.size;
  var vsw = vs.width;
  var vsh = vs.height;
  var vss = view.size / 10;
  var vssw = vss.width;
  var vssh = vss.height;

  //screen changer
  var nscreen = 1;
  var screens = [];
  var screen_names = {};
  screen_names['button1'] = 1;
  var curscreen;
  for (var idx = 0; idx < nscreen; idx++) {
    screens.push(new Layer());
  }

  function changeScreen(page) {
    //
    if (page < 1) page = 1;
    if (page > nscreen) page = nscreen;
    curscreen = page;
    for (var idx = 0; idx < nscreen; idx++) {
      if (idx == page - 1) {
        screens[idx].bringToFront();
        top.bringToFront();
      } else {
        screens[idx].sendToBack();
      }
    }
  }

  function nextScreen() {
    if (curscreen + 1 <= nscreen) {
      curscreen++;
      changeScreen(curscreen);
    }
  }

  function prevScreen() {
    if (curscreen - 1 > 0) {
      curscreen--;
      changeScreen(curscreen);
    }
  }

  function changeScreenByName(pagename) {
    changeScreen(screen_names[pagename]);
  }

  function getScreenNameNext() {
    if (curscreen + 1 <= nscreen) {
      return Object.keys(screen_names)[curscreen + 1 - 1];
    } else {
      return Object.keys(screen_names)[curscreen - 1];
    }
  }

  function getScreenNamePrev() {
    if (curscreen - 1 > 0) {
      return Object.keys(screen_names)[curscreen - 1 - 1];
    } else {
      return Object.keys(screen_names)[curscreen - 1];
    }
  }

  //top layer
  var top = new Layer(); // new Layer() will be automatically activated at the moment.

  //networking - socket.io
  var socket = io(window.location.protocol + "//" + window.location.host);

  //net. connection marker
  var netstat = new Path.Circle({
    center: view.bounds.topRight + [-vssw / 2, +vssw / 2],
    radius: vssw / 4,
    fillColor: 'hotpink',
    strokeWidth: 2,
    strokeColor: 'gray',
    dashArray: [4, 4],
    onFrame: function(event) {
      this.rotate(1);
    }
  });
  netstat.fillColor.alpha = 0;

  //
  socket.on('connect', function() {
    console.log("i' m connected!");
    top.activate();
    netstat.fillColor.alpha = 1;
    socket.on('disconnect', function() {
      console.log("i' m disconnected!");
      top.activate();
      netstat.fillColor.alpha = 0;
    });
  });

  //screen #1
  changeScreen(1);
  new Path.Rectangle([0, 0], vs).fillColor = '#abc'; //;

  new Path.Circle({
    center: view.center,
    radius: 50,
    fillColor: 'gold',
    _offColor: 'gold',
    _onColor: 'white',
    onMouseDown: function (event) {
      //
      this.fillColor = this._onColor;
      //
      socket.emit('button', {
        id: 0,
        name: 'button1',
        value: 1,
        state: 'on'
      });
    },
    onMouseUp: function (event) {
      //
      this.fillColor = this._offColor;
      //
      socket.emit('button', {
        id: 0,
        name: 'button1',
        value: 0,
        state: 'off'
      });
    }
  })

  //network event handlers

  //event: 'sound'
  socket.on('sound', function(sound) {
    if (sound.name == 'clap') {
      if (sound.action == 'start') {
        clap.start();
      }
    }
  });

  //event: 'osc-msg'
  socket.on('osc-msg', function(msg) {
    if (msg.address == '/hue') {
      console.log(msg.args[0].value);
      netstat.fillColor.hue = msg.args[0].value;
    }
  });

});
