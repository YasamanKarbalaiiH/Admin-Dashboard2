import json
import os

import chromadb
import requests

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

load_dotenv()

api_key = os.getenv("KIE_API_KEY")
db_path = os.getenv("DASHBOARD_DB_PATH")

if not api_key:
    raise ValueError("KIE_API_KEY was not found in .env")

if not db_path:
    raise ValueError("DASHBOARD_DB_PATH was not found in .env")

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

chroma_client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = chroma_client.get_or_create_collection(
    name="dashboard_data"
)


def load_database():
    with open(
        db_path,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def create_chunks(database):
    chunks = []

    for customer in database["customers"]:
        chunks.append(
            f"""
Customer:
Name: {customer["name"]}
Email: {customer["email"]}
Phone: {customer["phone"]}
Company: {customer["company"]}
Status: {customer["status"]}
Created At: {customer["createdAt"]}
""".strip()
        )

    for product in database["products"]:
        chunks.append(
            f"""
Product:
Name: {product["name"]}
Category: {product["category"]}
Price: {product["price"]}
Stock: {product["stock"]}
Status: {product["status"]}
""".strip()
        )

    for invoice in database["invoices"]:
        chunks.append(
            f"""
Invoice:
Invoice Number: {invoice["invoiceNumber"]}
Customer: {invoice["customer"]}
Date: {invoice["date"]}
Due Date: {invoice["dueDate"]}
Amount: {invoice["amount"]}
Status: {invoice["status"]}
""".strip()
        )

    statistics = database["dashboard"]["statistics"]

    chunks.append(
        f"""
Dashboard Statistics:
Total Customers: {statistics["customers"]}
Total Products: {statistics["products"]}
Total Invoices: {statistics["invoices"]}
Total Revenue: {statistics["revenue"]}
""".strip()
    )

    for revenue in database["dashboard"]["revenue"]:
        chunks.append(
            f"""
Monthly Revenue:
Month: {revenue["month"]}
Revenue: {revenue["value"]}
""".strip()
        )

    profile = database["profile"]

    chunks.append(
        f"""
Profile:
Name: {profile["name"]}
Role: {profile["role"]}
Email: {profile["email"]}
Phone: {profile["phone"]}
Location: {profile["location"]}
Joined: {profile["joined"]}
""".strip()
    )

    settings = database["settings"]

    chunks.append(
        f"""
Settings:
Email Notifications: {settings["emailNotifications"]}
Push Notifications: {settings["pushNotifications"]}
Dark Mode: {settings["darkMode"]}
""".strip()
    )

    return chunks


def sync_database():
    database = load_database()
    chunks = create_chunks(database)

    existing_data = collection.get()

    if len(existing_data["ids"]) > 0:
        collection.delete(
            ids=existing_data["ids"]
        )

    embeddings = embedding_model.encode(
        chunks
    ).tolist()

    collection.add(
        ids=[
            f"data-{i}"
            for i in range(len(chunks))
        ],
        documents=chunks,
        embeddings=embeddings
    )


sync_database()


def ask_rag(question: str):
    question_embedding = embedding_model.encode(
        question
    ).tolist()

    results = collection.query(
        query_embeddings=[
            question_embedding
        ],
        n_results=3
    )

    relevant_chunks = results["documents"][0]

    context = "\n\n".join(
        relevant_chunks
    )

    prompt = f"""
You are an AI assistant for the Toko Admin Dashboard.

Answer the user's question using only the information provided in the context.

If the answer is not available in the context, say:

"I don't have enough information to answer that question based on the available data."

Do not use outside knowledge.

Context:

{context}

Question:

{question}
"""

    url = "https://api.kie.ai/openai/v1/responses"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "gpt-6-astra",
        "input": prompt,
        "stream": True
    }

    response = requests.post(
        url,
        headers=headers,
        json=data,
        timeout=60,
        verify=False
    )

    response.raise_for_status()

    answer = ""

    for line in response.text.splitlines():
        if not line.startswith("data:"):
            continue

        data_text = line[5:].strip()

        if not data_text or data_text == "[DONE]":
            continue

        try:
            event = json.loads(data_text)
        except json.JSONDecodeError:
            continue

        if event.get("type") == "response.output_text.delta":
            answer += event.get("delta", "")

    return answer