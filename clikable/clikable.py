import os
import json
import time

from bottle import route, run, template, request
from bottle import static_file

cliklog = open('cliklog.log', 'a')
solutions = {"1": "B", "2": "B", "3": "A", "4": "C", "5": "B", "6": "A", "7": "C"}

@route('/event', method="POST")
def log_event():
    """Log an event

    type = 'pageview' or 'answer'
    """
    p = request.params
    type = p['type']

    out = {"stamp": time.time(),
           "type": type}

    if type == 'answer':
        out['question'] = p['question']
        if solutions[p['question']] == p['answer']:
            out['winner'] = 1
        else:
            out['loser'] = 1

    cliklog.write(json.dumps(out) + "\n")
    cliklog.flush()

#
# Serve static files
#
@route('/<filename:path>')
def server_static(filename):
    return static_file(filename, root='static')

run(host="0.0.0.0", port=8081)








