from app import app as application

def create():
    print("[AI EXT] Initialising lva ai extension web app")
    application.run(host='127.0.0.1', port=5444)