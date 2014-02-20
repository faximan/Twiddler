#from gevent.wsgi import WSGIServer
import gevent
from server import app

http_server = gevent.wsgi.WSGIServer(('', 5000), app)
http_server.serve_forever()
