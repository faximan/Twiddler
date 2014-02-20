from flask import Flask
app = Flask(__name__)

# Import all route() functions after the app object is created.
import server
