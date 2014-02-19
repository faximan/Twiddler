import sqlite3
import uuid  # Token generator.
from os import urandom  # Generating cryptographically secure password salts.
import hashlib  # MD5 hasher
import base64
import json
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
    return json.dumps({"SUCCESS" : success, "MESSAGE" : message, "DATA" : data})

# Returns the email address for the given token assuming the token
# corresponds to one of the active users (or None otherwise).
def email_for_token(token):
    return active_users.get(token)

# Returns true if the passed in token belongs to an active user.
def is_logged_in(token):
    return email_for_token(token) != None

# Convert form sqlite3 Row to Python dict
def dict_from_row(row):
    return dict(zip(row.keys(), row))

# Takes a username and gets all user info from the database, removes
# the password field and returs as a string for sending back to the client.
def parse_user(email):
    user = get_user_for_email(get_db(), email)

    # Make sure that we found a user
    if user is None:
        return None

    user_dict = dict_from_row(user)
    del user_dict["password"]
    return user_dict

# Fetches all posts that have the given email as receiver.
def parse_posts(email):
    posts = get_posts_for_email(get_db(), email)
    res = []

    # The posts are given as a list of sqlite3 Rows. We need to convert
    # them to Python dictionaries to be able to reply to the client.
    for post in posts:
        res.append(dict_from_row(post))
    return res

# ----------- Secure password storage helper functions -----------------
# Never reuse salts. This is cryptographically secure. 'hash' is not.
def generate_salt():
    return base64.urlsafe_b64encode(urandom(32))

# MD5 hashing
def hash_password(password, salt):
    hash_object = hashlib.md5(salt + password)
    return hash_object.hexdigest()

# ----------- Required functions from the lab skeleton -----------------
# Description: Authenticates the username by the provided password.
# Input: Two string values representing the username (email address) and password.
# Returned data: A string value containing a randomly generated access token if the authentication successful.
def sign_in(username, password):
    user = get_user_for_email(get_db(), username)
    if user is None:
        return response(False, "Wrong username/password", "")

    hashed_password = hash_password(password, user["salt"])
    if hashed_password != user["password"]:
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
    # Hash passwords with salt to make them more secure. Never reuse salts.
    salt = generate_salt()
    hashed_password = hash_password(password, salt)

    result = add_user_to_db(get_db(), email, hashed_password, salt, firstname, familyname, gender, city, country)
    if result == False:
        return response(False, "That email is already in use.", "");
    else:
        return response(True, "Successfully added a new user", "")

# Description: Signs out a user from the system.
# Input: A string containing the access token of the user requesting to sign out.
# Returned data: -
def sign_out(token):
    if not is_logged_in(token):
        return response(False, "You don't seem to be logged in", "")
    # Remove this user from the list of active users
    del active_users[token]
    return response(True, "You have successfully logged out", "")

# Description: Changes the password of the current user to a new one.
# Input:
#     token: A string containing the access token of the current user
#     oldPassword: The old password of the current user
#     newPassword: The new password
# Returned data:
def change_password(token, old_password, new_password):
    if not is_logged_in(token):
        return response(False, "You don't seem to be logged in", "")
    email = email_for_token(token)
    user = get_user_for_email(get_db(), email)

    hashed_old_password = hash_password(old_password, user["salt"])
    if ( hashed_old_password != user["password"] ):
        return response(False, "The old password is wrong", "")

    # Hash the new password. Never reuse salt.
    new_salt = generate_salt()
    hashed_new_password = hash_password(new_password, new_salt)
    update_password(get_db(), email, hashed_new_password, new_salt)
    return response(True, "Password updated", "")

# Description: Retrieves the stored data for the user whom the passed token is issued for. The currently signed in user can use this method to retrieve all its own information from the server.
# Input: A string containing the access token of the current user.
# Returned data: A user object containing the following fields:
#                email, firstname, familyname, gender, city and country.
def get_user_data_by_token(token):
    if not is_logged_in(token):
        return response(False, "You don't seem to be logged in", "")
    user = parse_user(email_for_token(token))
    if user is None:
        return response(False, "User not found", "")
    return response(True, "Successfully fetched user data", user)

# Description: Retrieves the stored data for the user specified by the passed email address.
# Input:
#     token: A string containing the access token of the current user
#     email: The email address of the user to retrieve data for
# Returned data: A user object containing the following fields:
#                email, firstname, familyname, gender, city and country.
def get_user_data_by_email(token, email):
    if not is_logged_in(token):
        return response(False, "You don't seem to be logged in", "")
    user = parse_user(email)
    if user is None:
        return response(False, "User not found", "")
    return response(True, "Successfully fetched user data", user)

# Description: Retrieves the stored messages for the user whom the passed token is issued for. The currently signed in user can use this method to retrieve all its own messages from the server.
# Input: A string containing the access token of the current user.
# Returned data: An array containing all messages sent to the user.
def get_user_messages_by_token(token):
    if not is_logged_in(token):
        return response(False, "You don't seem to be logged in", "")
    posts = parse_posts(email_for_token(token))
    return response(True, "Successfully fetched posts", posts)

# Description: Retrieves the stored messages for the user specified by the passed email address.
# Input:
#     token: A string containing the access token of the current user
#     email: The email address of the user to retrieve messages for
# Returned data: An array containing all messages sent to the user.
def get_user_messages_by_email(token, email):
    if not is_logged_in(token):
        return response(False, "You don't seem to be logged in", "")
    posts = parse_posts(email)
    return response(True, "Successfully fetched posts", posts)

#Description: Tries to post a message to the wall of the user specified by the email address.
# Input:
#     token: A string containing the access token of the current user
#     message: The message to post
#     email: The email address of the recipient
# Returned data:
def post_message(token, message, email):
    if not is_logged_in(token):
        return response(False, "You don't seem to be logged in", "")
    if get_user_for_email(get_db(), email) is None:
        return response(False, "Recipient not found", "")
    post_message_to_db(get_db(), message, email_for_token(token), email)
    return response(True, "Successfully posted a message", "")

# -----------------------------------------------------------------------

# ----------------  Handlers for different URL's ------------------------
# Entry point to the webpage. Should return index.html?
@app.route('/', methods=['GET'])
def hello():
    return "Twiddler"

@app.route('/sign_in', methods=['POST'])
def sign_in_handler():
    password = request.form['password']
    username = request.form['username']
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

@app.route('/sign_out', methods=['GET'])
def sign_out_handler():
    token = request.args['token']
    return sign_out(token)

@app.route('/change_password', methods=['POST'])
def change_password_handler():
    token = request.form['token']
    new_password = request.form['new_password']
    old_password = request.form['old_password']
    return change_password(token, old_password, new_password)

@app.route('/get_user_data_by_token', methods=['GET'])
def get_user_data_by_token_handler():
    token = request.args['token']
    return get_user_data_by_token(token)

@app.route('/get_user_data_by_email', methods=['GET'])
def get_user_data_by_email_handler():
    token = request.args['token']
    email = request.args['email']
    return get_user_data_by_email(token, email)

@app.route('/get_user_messages_by_token', methods=['GET'])
def get_user_messages_by_token_handler():
    token = request.args['token']
    return get_user_messages_by_token(token)

@app.route('/get_user_messages_by_email', methods=['GET'])
def get_user_messages_by_email_handler():
    token = request.args['token']
    email = request.args['email']
    return get_user_messages_by_email(token, email)

@app.route('/post_message', methods=['POST'])
def post_message_handler():
    token = request.form['token']
    message = request.form['message']
    email = request.form['email']
    return post_message(token, message, email)

# --------------------------------------------------------------

# CORS!
@app.after_request
def after(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'POST, GET')
    response.headers.add('Access-Control-Allow-Headers', 'X-Requested-With')
    response.headers.add('Access-Control-Max-Age', '1728000')
    return response

# Start the Flask web server.
if __name__ == "__main__":
    app.run(debug=True)
