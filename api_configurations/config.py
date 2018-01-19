import os

db_url = os.getenv("MONGODB_URL")
username = os.getenv("MONGODB_USER")
password = os.getenv("MONGODB_PASS")
db_name = os.getenv("DB_NAME")
auth_mechanism = os.getenv("AUTH_MECHANISM")
