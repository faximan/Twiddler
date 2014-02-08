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
    connection.commit()
    connection.close()

# Fetches a user for a given email.
def get_user_for_email(db, email):
    cur = db.cursor()
    cur.execute('SELECT * FROM users WHERE users.email=?', (email,))
    return cur.fetchone()

# Add a user to the database.
def add_user_to_db(db, email, password, firstname, familyname, gender, city, country):
    t = (email, password, firstname, familyname, gender, city, country, )
    cur = db.cursor()
    try:
        cur.execute('INSERT INTO users VALUES(?,?,?,?,?,?,?)', t)
        db.commit()
    except sqlite3.Error as e:
        return False  # User already exists? Empty values or wrong types?
    return True
