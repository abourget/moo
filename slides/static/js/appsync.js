
head.ready(function() {
  var socket = io.connect('/presentation');

  socket.on('slide', function(h, v) {
    Reveal.slide(h, v);
  });

  Reveal.addEventListener('slidechanged', function(ev) {
    var h = ev.indexh;
    var v = ev.indexv;
    socket.emit("slidechanged", {h: h, v: v});
  });
});
