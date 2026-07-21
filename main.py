import time
import subprocess
import threading
from flask import Flask
import os 
app = Flask(__name__)
def python_ex(name):
    subprocess.run(["node", name])
@app.route('/')
def index():
    return "Hosting python and node js."

if __name__ == '__main__':
    
    thread1 = threading.Thread(target=python_ex, args=["bot.js"])
    thread1.start()
    # 4. Run the Flask development server
    # use_reloader=False prevents the thread from executing twice during code reloads
    app.run(host="0.0.0.0")
