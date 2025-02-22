from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

load_dotenv()
uri = os.getenv('uri')

client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    db_name = "Hackathon"
    db = client[db_name]
    threads_collection = db.get_collection("Threads")

    document = {
        "messages": [],
        "thread_id": "test",
        "query": "text query"
    }

    threads_collection.insert_one(document)
    print("Document inserted successfully.")

except Exception as e:
    print(e)