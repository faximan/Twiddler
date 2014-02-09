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

# Updates the password for the given email
def update_password(db, email, new_password, new_salt):
    cur = db.cursor()
    cur.execute("UPDATE users SET password=?,salt=? WHERE email=?", (new_password, new_salt, email,))
    db.commit()

# Add a user to the database.
def add_user_to_db(db, email, password, salt, firstname, familyname, gender, city, country):
    t = (email, password, salt, firstname, familyname, gender, city, country, )
    cur = db.cursor()
    try:
        cur.execute('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)', t)
        db.commit()
    except sqlite3.Error as e:
        return False  # User already exists
    return True

# Fetches all posts with the given receiver
def get_posts_for_email(db, receiver):
    cur = db.cursor()
    cur.execute('SELECT * FROM posts WHERE posts.receiver=?', (receiver,))
    res = cur.fetchall()
    print res;
    return res

# Add a post to the database
def post_message_to_db(db, message, sender, receiver):
    cur = db.cursor()
    t = (sender, receiver, message,)
    cur.execute('INSERT INTO posts ("sender", "receiver", "body") VALUES(?,?,?)', t)
    db.commit()
