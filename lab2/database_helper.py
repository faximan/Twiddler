import sqlite3

# The name of our SQLite database on disk.
DATABASE = 'database.db'

# Reads and executes the database.schema SQL script to setup
# our database. Can be run from a Python shell.
def create_tables():
    fd = open('database.schema', 'r')
    create_sql_file = fd.read()
    fd.close()

    # All the different SQL commands in the file are separated by semicolon.
    sql_commands = create_sql_file.split(';')

    # We need the database cursor to execute SQL queries. For all other
    # methods in this file, the cursor is passed as an object to the function.
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    for command in sql_commands:
        cursor.execute(command)

# Fetches a user for a given email.
def get_user_for_email(db, email):
    t = (email,)
    db.execute('SELECT * FROM users WHERE users.email=?', t)
    result = db.fetchone()
    if result is None:
        # No users was found for the given token.
        return None
    else:
        return result

# Fetches a user for a given token.
def get_user_for_token(db, token):
    t = (token,)
    db.cursor().execute('SELECT users.* FROM users, tokens WHERE users.email = tokens.email AND tokens.token=?', t)
    result = db.cursor().fetchone()
    if result is None:
        # No users was found for the given token.
        return None
    else:
        return result

def add_user_to_db(db, email, password, firstname, familyname, gender, city, country):
    t = (email, password, firstname, familyname, gender, city, country, )
    try:
        db.cursor().execute('INSERT INTO users VALUES(?,?,?,?,?,?,?)', t)
        db.commit()
    except sqlite3.Error as e:
        return False  # User already exists? Empty values or wrong types?
    return True
