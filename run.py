from api import app
import os


if __name__ == "__main__":
    app.run(port=int(os.getenv("PORT")), threaded=True)
