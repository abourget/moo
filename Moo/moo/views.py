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
        self.session['speed'] = 1.0
    def recv_connect(self):
        print "CONNECT!"
        self.spawn(self.job_send_things)

    def on_new_speed(self, speed):
        print "NEW SPEED", speed
        self.session['speed'] = speed

    def job_send_things(self):
        cnt = 0
        while True:
            cnt += 1
            tm = time.time()
            self.emit("cpu", {"cpu": 123,
                              "live_data": (tm * 1000,
                                            math.sin(tm))})
            gevent.sleep(self.session['speed'])

@view_config(route_name="socketio")
def iohandler(request):
    from socketio import socketio_manage
    socketio_manage(request.environ, {'/cpu': CPUNamespace},
                    request)