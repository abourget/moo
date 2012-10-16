from pyramid.view import view_config

@view_config(route_name='home', renderer='templates/index.html')
def my_view(request):
    return {'project': 'Moo'}



from socketio.namespace import BaseNamespace
import gevent
import time
import math

class CPUNamespace(BaseNamespace):
    def initialize(self):
        print "INIT!"
    def recv_connect(self):
        print "CONNECT!"
        self.spawn(self.job_send_things)
    def job_send_things(self):
        cnt = 0
        while True:
            cnt += 1
            self.emit("cpu", {"cpu": 123,
                              "live_data": (time.time() * 1000,
                                            math.sin(cnt * 0.2))})
            gevent.sleep(0.20)

@view_config(route_name="socketio")
def iohandler(request):
    from socketio import socketio_manage
    socketio_manage(request.environ, {'/cpu': CPUNamespace},
                    request)