from gevent import monkey; monkey.patch_all()

import os

from bottle import route, run, template, request
from bottle import static_file


#
# Real-time
#
from socketio.namespace import BaseNamespace
class PresentationNamespace(BaseNamespace):
    def initialize(self):
        print "INIT"
        self.emit("slide", 2, 3)

    def on_slidechanged(self, *args, **kwargs):
        print "SLIDECHANGED"
        print "Got a message", args, kwargs

from socketio import socketio_manage
@route('/socket.io/<remaining:path>')
def index(remaining):
    socketio_manage(request.environ, {'/presentation': PresentationNamespace},
                    request)


#
# Serve static files
#
@route('/<filename:path>')
def server_static(filename):
    return static_file(filename, root='static')


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
                       policy_server=policy_server).serve_forever()

run(server=SocketIOServer, host='localhost', port=8080)
