import sqlite3
import uuid  # Token generator
from flask import Flask, g, request
from database_helper import *

app = Flask(__name__)

# The tokens of the currently logged in users. Maps from token to email.
active_users = {}

# Opens the connection to our database on file.
def connect_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row  # Makes db cursor return python dicts instead of tuples.
    return db

# Opens a connection to our database if there isn't one already.
# Returns a cursor to the database.
def get_db():
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

# Close the database connection again at the end of the request.
@app.teardown_appcontext
def close_db(error):
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

# Returns a string in a human readable format for the given parameters.
# Success is given as a bool, the other two as strings.
def response(success, message, data):
    return "SUCCESS: " + str(success) + ", MESSAGE: " + message + ", DATA: " + data;

def email_for_token(token):
    return active_users.get(token, default=None)

# Returns true if the passed in token belongs to an active user.
def is_logged_in(token):
    return email_for_token(token) != None

# ----------- Required functions from the lab skeleton -----------------
# Description: Authenticates the username by the provided password.
# Input: Two string values representing the username (email address) and password.
# Returned data: A string value containing a randomly generated access token if the authentication successful.
def sign_in(username, password):
    user = get_user_for_email(get_db(), username)
    if user is None:
        return response(False, "Unknown user", "")
    elif password != user["password"]:
        return response(False, "Wrong username/password", "")
    else:
        # Generate random access token and add to logged in users.
        token = str(uuid.uuid4())
        active_users[token] = username
        return response(True, "Login successful", token)

# Description: Registers a user in the database.
# Input: Seven string values representing the following: email, password, firstname, familyname, gender, city and country.
# Returned data: -
def sign_up(email, password, firstname, familyname, gender, city, country):
    result = add_user_to_db(get_db(), email, password, firstname, familyname, gender, city, country)
    if result == False:
        return response(False, "Error adding user to database. A user with that email probably exists already.", "");
    else:
        return response(True, "Successfully added a new user", "")

# Description: Signs out a user from the system.
# Input: A string containing the access token of the user requesting to sign out.
# Returned data:
def sign_out(token):
    print 'sign out'

# Description: Changes the password of the current user to a new one.
# Input:
#     token: A string containing the access token of the current user
#     oldPassword: The old password of the current user
#     newPassword: The new password
# Returned data:
def change_password(token, old_password, new_password):
    print "change password"

# Description: Retrieves the stored data for the user whom the passed token is issued for. The currently signed in user can use this method to retrieve all its own information from the server.
# Input: A string containing the access token of the current user.
# Returned data: A user object containing the following fields:
#                email, firstname, familyname, gender, city and country.
def get_user_data_by_token(token):
    print "get user data by token"

# Description: Retrieves the stored data for the user specified by the passed email address.
# Input:
#     token: A string containing the access token of the current user
#     email: The email address of the user to retrieve data for
# Returned data: A user object containing the following fields:
#                email, firstname, familyname, gender, city and country.
def get_user_data_by_email(token, email):
    print "get user by email"

# Description: Retrieves the stored messages for the user whom the passed token is issued for. The currently signed in user can use this method to retrieve all its own messages from the server.
# Input: A string containing the access token of the current user.
# Returned data: An array containing all messages sent to the user.
def get_user_messages_by_token(token):
    print "get user messages by token"

# Description: Retrieves the stored messages for the user specified by the passed email address.
# Input:
#     token: A string containing the access token of the current user
#     email: The email address of the user to retrieve messages for
# Returned data: An array containing all messages sent to the user.
def get_user_messages_by_email(token, email):
    print "get user messages by email"

#Description: Tries to post a message to the wall of the user specified by the email address.
# Input:
#     token: A string containing the access token of the current user
#     message: The message to post
#     email: The email address of the recipient
# Returned data:
def post_message(token, message, email):
    print "post message"

# -----------------------------------------------------------------------

# -------------  Handlers for different URL's -------------------
# Entry point to the webpage. Should return index.html?
@app.route("/")
def hello():
    return "Twiddler"

@app.route('/sign_in', methods=['POST'])
def sign_in_handler():
    username = request.form['username']
    password = request.form['password']
    return sign_in(username, password)

@app.route('/sign_up', methods=['POST'])
def sign_up_handler():
    email = request.form['email']
    password = request.form['password']
    firstname = request.form['firstname']
    familyname = request.form['familyname']
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']
    return sign_up(email, password, firstname, familyname, gender, city, country)
# --------------------------------------------------------------

# Start the Flask web server.
if __name__ == "__main__":
    app.run(debug=True)
