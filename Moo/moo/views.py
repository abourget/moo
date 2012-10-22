from pyramid.view import view_config

@view_config(route_name='home', renderer='templates/index.html')
def my_view(request):
    return {'project': 'Moo'}



from socketio.namespace import BaseNamespace
import gevent
import time
import math
import json

class StatNamespace(BaseNamespace):
    def initialize(self):
        print "STAT INIT"
        self.session['speed'] = 1.0
        self.spawn(self.job_grab_clik_data)
        self.spawn(self.job_send_sine)

    def on_new_speed(self, speed):
        print "NEW SPEED", speed
        self.session['speed'] = speed

    def job_send_sine(self):
        cnt = 0
        while True:
            cnt += 1
            tm = time.time()
            self.emit("cpu", {"cpu": 123,
                              "live_data": (tm * 1000,
                                            math.sin(tm))})
            gevent.sleep(self.session['speed'])

    def job_grab_clik_data(self):
        import gevent_subprocess as sp
        p = sp.Popen('tail -f ~/moo/clikable/cliklog.log -n 100', shell=True,
                     stdout=sp.PIPE)
        line = p.stdout.readline()
        while line:
            print "GOT A LINE", line
            self.emit("clik", json.loads(line))
            line = p.stdout.readline()

@view_config(route_name="socketio")
def iohandler(request):
    from socketio import socketio_manage
    socketio_manage(request.environ, {'/stat': StatNamespace},
                    request)