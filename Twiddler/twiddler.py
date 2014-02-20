from Twiddler import app
from gevent import pywsgi

# Create and start the web server.
http_server = pywsgi.WSGIServer(('', 5000), app)
http_server.serve_forever()
