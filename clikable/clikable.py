import os

from bottle import route, run, template, request
from bottle import static_file

cliklog = open('cliklog.log', 'a')

@route('/event')
def got_event():
    data = request.params
    print data

#
# Serve static files
#
@route('/<filename:path>')
def server_static(filename):
    return static_file(filename, root='static')


run(host="0.0.0.0", port=8081)