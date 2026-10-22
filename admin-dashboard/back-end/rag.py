import json
import os
import chromadb
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import joblib
from openai import OpenAI

# Load environment variables
load_dotenv()

api_key = os.getenv("GAPGPT_API_KEY")
db_path = os.getenv("DASHBOARD_DB_PATH")

if not api_key:
    raise ValueError("GAPGPT_API_KEY was not found in .env")

if not db_path:
    raise ValueError("DASHBOARD_DB_PATH was not found in .env")


# Initialize embedding model and vector database
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
router_model = joblib.load("router_model.pkl")
retrieval_model = joblib.load("retrieval_model.pkl")

chroma_client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = chroma_client.get_or_create_collection(
    name="dashboard_data"
)


# Load dashboard database
def load_database():
    with open(
        db_path,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


# Convert database records into searchable chunks
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


# Sync dashboard data with ChromaDB
def sync_database():
    database = load_database()
    chunks = create_chunks(database)

    existing_data = collection.get()

    if existing_data["ids"]:
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


# Send prompt to the LLM
def call_llm(prompt: str) -> str:
    client = OpenAI(
           base_url="https://api.gapgpt.app/v1",
           api_key=api_key
       )
   
    response = client.chat.completions.create(
           model="gpt-4o",
           messages=[
               {
                   "role": "user",
                   "content": prompt
               }
           ],
           temperature=0,
           max_tokens=500
       )
   
    answer = response.choices[0].message.content
   
    if not answer or not answer.strip():
           raise RuntimeError(
               f"GAPGPT returned an empty response: {response.model_dump()}"
           )
   
    return answer.strip()






# Decide whether retrieval is required
def route_question(question: str) -> str:
    question_embedding = embedding_model.encode([question])
    decision = router_model.predict(question_embedding)[0]

    return decision


# Retrieve relevant dashboard data
def retrieve(question: str) -> str:
    question_embedding = embedding_model.encode(
        [question]
    ).tolist()

    results = collection.query(
        query_embeddings=question_embedding,
        n_results=10
    )

    chunks = results["documents"][0]

    return "\n\n".join(chunks)


# Generate a natural answer without retrieval
def answer_without_rag(question: str) -> str:
    print("no-rag")
    prompt = f"""
Answer the user's question naturally.

Question:
{question}
"""

    return call_llm(prompt)


# Generate an answer from retrieved context
def generate_answer(question: str, context: str) -> str:
    prompt = f"""
Answer the question using only the provided context.

If the answer is unavailable, say:
"I don't have enough information to answer that question based on the available data."

Context:
{context}

Question:
{question}
"""

    return call_llm(prompt)


# Check whether retrieved context is relevant
def grade_retrieval(question: str, context: str) -> str:
    text = question + " " + context
    
    embedding = embedding_model.encode([text])

    decision = retrieval_model.predict(embedding)[0]


    return decision


# Rewrite the query for better retrieval
def rewrite_query(question: str) -> str:
    print("rewrite")
    prompt = f"""
Rewrite the question into a concise search query for dashboard data.

Preserve names, products, customers, invoice numbers, dates,
and other important entities.

Return only the rewritten query.

Question:
{question}
"""

    return call_llm(prompt).strip()


# Run the Adaptive RAG pipeline
def ask_rag(question: str):
    decision = route_question(question)

    if decision == "no_rag":
        return answer_without_rag(question)

    context = retrieve(question)
    print("rag")

    retrieval_grade = grade_retrieval(
        question,
        context
    )

    if retrieval_grade == "not_relevant":
        rewritten_query = rewrite_query(question)

        context = retrieve(
            rewritten_query
        )

    return generate_answer(
        question,
        context
    )