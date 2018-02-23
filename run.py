from api import app
import os


if __name__ == "__main__":
    app.run(port=os.getenv("PORT"), threaded=True)
