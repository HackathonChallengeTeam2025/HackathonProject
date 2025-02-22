from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import traceback
import os
from datetime import datetime
from typing import List, Optional
from openai import OpenAI
from playwright.async_api import async_playwright
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from uuid import uuid4
import hashlib
import base64
from typing import Dict, Union
import os

load_dotenv()
uri = os.getenv('uri')
uri="mongodb+srv://HackathonChallengeTeam2025:Hackathon123$@hackathonchallengeteam2.3uqva.mongodb.net/?retryWrites=true&w=majority&appName=HackathonChallengeTeam2025"

client = MongoClient(uri, server_api=ServerApi('1'))
db_name = "Hackathon"
db = client[db_name]
threads_collection = db.get_collection("Threads")

# Global variables
KNOWLEDGE_GRAPH_FILE = "knowledge_graph.json"
SCREENSHOT_DIR = "screenshots"
if not os.path.exists(SCREENSHOT_DIR):
    os.makedirs(SCREENSHOT_DIR)


def load_graph():
    """
    Load the knowledge graph from the JSON file.
    If the file doesn't exist, return an empty dictionary.
    """
    if os.path.exists(KNOWLEDGE_GRAPH_FILE):
        with open(KNOWLEDGE_GRAPH_FILE, "r") as f:
            return json.load(f)
    return {}

def save_graph(graph):
    """
    Save the knowledge graph to the JSON file.
    """
    with open(KNOWLEDGE_GRAPH_FILE, "w") as f:
        json.dump(graph, f, indent=2)

def get_state_id(clickable_components: List[Dict[str, str]]):
    """
    Generate a state ID from clickable components by hashing their innerText.
    """
    texts = sorted([comp["innerText"] for comp in clickable_components])
    elements_str = ",".join(texts)
    return hashlib.md5(elements_str.encode()).hexdigest()

def save_screenshot(screenshot_base64: str, id: str):
    """
    Save the base64-encoded screenshot to a file, associated with the transition ID.
    """
    screenshot_data = base64.b64decode(screenshot_base64.split(",")[1])
    screenshot_path = os.path.join(SCREENSHOT_DIR, f"{id}.png")
    with open(screenshot_path, "wb") as f:
        f.write(screenshot_data)
    return screenshot_path



db = {}
with open("/Users/admin/Documents/HackathonProject/backend/db.json", "r") as f:
    db = json.load(f)

def fetch_document_by_thread_id(thread_id: str):
    try:
        document = threads_collection.find_one({"thread_id": thread_id})
        if document:
            print(f"Document with thread_id {thread_id} fetched successfully.")
        else:
            print(f"No document found with thread_id {thread_id}.")
        return document
    except Exception as e:
        print(f"An error occurred while fetching the document: {e}")
        return None

def create_new_document(messages: list, thread_id: str, query: str):
    try:
        new_document = {
            "messages": messages,
            "thread_id": thread_id,
            "goal": query
        }
        result = threads_collection.insert_one(new_document)
        print(f"New document with thread_id {thread_id} created successfully.")
        return result
    except Exception as e:
        print(f"An error occurred while creating the document: {e}")
        return None
    
def update_document_by_thread_id(thread_id: str, new_data: dict):
    try:
        result = threads_collection.update_one({"thread_id": thread_id}, {"$set": new_data})
        if result.modified_count > 0:
            print(f"Document with thread_id {thread_id} updated successfully.")
        else:
            print(f"No document found with thread_id {thread_id}.")
        return result
    except Exception as e:
        print(f"An error occurred while updating the document: {e}")
        return None


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Models
class ClickableComponent(BaseModel):
    innerText: str

class RequestData(BaseModel):
    screenshot: str
    clickableComponents: List[Dict[str, str]]
    query: str
    thread_id: Union[str, None] = None
    current_url: str
    last_clicked_button: str

class ClickInstruction(BaseModel):
    innerText: str
    whatDoYouSeeOnTheScreen: str
    didWeAchieveTheGoal: bool

class MctsRequest(BaseModel):
    initialUrl: str
    screenshot: str
    clickableComponents: List[ClickableComponent]

class ApiCall(BaseModel):
    url: str
    method: str
    status: int
    response: Optional[str] = None

class MctsNode(BaseModel):
    id: str  # Unique node ID
    url: str
    screenshot: str
    clickableElements: List[ClickableComponent]
    parentId: Optional[str] = None  # Reference to parent node
    parentAction: Optional[str] = None  # Action that led to this node
    depth: int
    apiCalls: List[ApiCall] = []


@app.post("/process")
async def process_data(data: RequestData):
    try:
        image_url = f"data:image/png;base64,{data.screenshot.split(',')[1]}"
        components_text = "\n".join([comp["innerText"] for comp in data.clickableComponents])
        # current_state_id = get_state_id(data.clickableComponents)

        # Handle new thread
        if not data.thread_id:
            thread_id = str(uuid4())
            messages = [
                {
                    "role": "system",
                    "content": "Analyze screenshots and queries to determine the next clickable element."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Query: '{data.query}'. Clickable components:\n{components_text}"
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url}
                        },
                    ],
                }
            ]
            completion = client.beta.chat.completions.parse(
                model="gpt-4o-2024-08-06",
                messages=messages,
                response_format=ClickInstruction,
                max_tokens=100,
            )
            instruction = completion.choices[0].message.parsed
            if instruction.innerText not in [comp["innerText"] for comp in data.clickableComponents]:
                raise ValueError(f"Invalid instruction: '{instruction.innerText}'")
            messages.append({"role": "assistant", "content": f"Clicked on: {instruction.innerText}"})
        else:
            thread_id = data.thread_id
            if thread_id not in db:
                raise ValueError(f"Invalid thread ID: '{thread_id}'")
            thread_document = db[thread_id]
            messages = thread_document["messages"]
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Query: '{data.query}'. Clickable components:\n{components_text}"
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    },
                ]
            })
            completion = client.beta.chat.completions.parse(
                model="gpt-4o-2024-08-06",
                messages=messages,
                response_format=ClickInstruction,
                max_tokens=100,
            )
            instruction = completion.choices[0].message.parsed
            if instruction.innerText not in [comp["innerText"] for comp in data.clickableComponents]:
                raise ValueError(f"Invalid instruction: '{instruction.innerText}'")

            # Append assistant message
            messages.append({"role": "assistant", "content": f"Clicked on: {instruction.innerText}"})

        db[thread_id] = {
            "messages": messages,
            "goal": data.query,
            "last_clicked_button": instruction.innerText
        }

        screenshot_path = save_screenshot(data.screenshot)

        return {"instruction": instruction.innerText, "thread_id": thread_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

from fastapi.testclient import TestClient
import asyncio

json_data = {}
with open("/Users/admin/Documents/HackathonProject/backend/data.json", "r") as f:
    json_data = json.load(f)
# Assuming 'app' is your FastAPI instance
# client = TestClient(app)

async def test_process_route():
    payload = json_data
    response = await process_data(
        RequestData(
            screenshot=payload["screenshot"],
            clickableComponents=payload["clickableComponents"],
            query=payload["query"],
            thread_id=payload["thread_id"],
            current_url=payload["current_url"],
            last_clicked_button=payload["last_clicked_button"]
        )
    )
    print(response)

if __name__ == "__main__":
    asyncio.run(test_process_route())