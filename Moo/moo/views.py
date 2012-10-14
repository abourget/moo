from pyramid.view import view_config

@view_config(route_name='home', renderer='templates/index.html')
def my_view(request):
    return {'project': 'Moo'}



from socketio.namespace import BaseNamespace

class CPUNamespace(BaseNamespace):
    def initialize(self):
        print "INIT!"
        self.emit("cpu", {"cpu": 123})
    def recv_connect(self):
        print "CONNECT!"
    def on_noop(self):
        print "RECEIVED noop"

@view_config(route_name="socketio")
def iohandler(request):
    from socketio import socketio_manage
    socketio_manage(request.environ, {'/cpu': CPUNamespace},
                    request)