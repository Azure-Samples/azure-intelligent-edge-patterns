from app import app as application

def create():
    application.run(host='127.0.0.1', port=5444)
