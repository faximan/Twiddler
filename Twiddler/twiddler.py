from Twiddler import app
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

# Create and start the web server.
http_server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
http_server.serve_forever()
