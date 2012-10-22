import math
import time
import gevent
import json

from pyramid.view import view_config

from socketio.namespace import BaseNamespace
class StatNamespace(BaseNamespace):
    def initialize(self):
        print "INIT!"
        self.session['speed'] = 1.0
        self.emit("sine", {"value": 123})
        self.spawn(self.job_send_sine)
        self.spawn(self.job_send_clik_data)

    def on_boo(self, *args):
        print "Got BOO", args

    def on_new_speed(self, speed):
        self.session['speed'] = float(speed)

    def job_send_sine(self):
        cnt = 0
        while True:
            cnt += 1
            tm = time.time()
            self.emit("sine", {"value": (tm * 1000,
                                         math.sin(tm))})
            gevent.sleep(self.session['speed'])

    def job_send_clik_data(self):
        import gevent_subprocess as subprocess
        p = subprocess.Popen("tail -f ~/moo/clikable/clikable.log -n 100",
                             shell=True,
                             stdout=subprocess.PIPE)
        line = p.stdout.readline()
        while line:
            print "CLIK DATA", line.strip()
            self.emit("clik", json.loads(line))
            line = p.stdout.readline()


@view_config(route_name="socketio")
def socketio(request):
    print "HERE"
    from socketio import socketio_manage
    socketio_manage(request.environ, {"/stat": StatNamespace},
                    request=request)

@view_config(route_name='home', renderer='templates/index.html')
def my_view(request):
    return {'project':'Moo'}
