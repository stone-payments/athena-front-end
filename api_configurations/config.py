import os
from pymongo import MongoClient

db_url = os.getenv("MONGODB_URL")
username = os.getenv("MONGODB_USER")
password = os.getenv("MONGODB_PASS")
db_name = str(os.getenv("DB_NAME"))
conn = MongoClient(db_url)
db = conn[db_name]
