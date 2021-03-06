from gevent import monkey; monkey.patch_all()

import os

from bottle import route, run, template, request
from bottle import static_file

PRESENTER_IP = '127.0.0.1'

last_slide = None

#
# Real-time
#
from socketio.namespace import BaseNamespace
from socketio.mixins import BroadcastMixin
class PresentationNamespace(BaseNamespace, BroadcastMixin):
    def initialize(self):
        print "INIT"
        if last_slide:
            self.emit("slide", *last_slide)

    def on_slidechanged(self, data):
        global last_slide
        print "SLIDECHANGED from", self.environ['REMOTE_ADDR'], data
        if self.environ['REMOTE_ADDR'] == PRESENTER_IP:
            last_slide = (data['h'], data['v'])
            self.broadcast_event_not_me('slide', data['h'], data['v'])

from socketio import socketio_manage
@route('/socket.io/<remaining:path>')
def index(remaining):
    socketio_manage(request.environ, {'/presentation': PresentationNamespace})


#
# Serve static files
#
@route('/<filename:path>')
def server_static(filename):
    return static_file(filename, root='static')

@route('/')
def root():
    return static_file('index.html', root='static')

#
# Serve it all
#
from bottle import ServerAdapter
class SocketIOServer(ServerAdapter):
    def run(self, handler):
        from socketio.server import SocketIOServer
        resource = self.options.get('resource', 'socket.io')
        policy_server = self.options.get('policy_server', False)
        SocketIOServer((self.host, self.port), handler, resource=resource,
                       policy_server=policy_server,
                       transports=["xhr-multipart", "xhr-polling"]).serve_forever()

run(server=SocketIOServer, host='0.0.0.0', port=8087)
