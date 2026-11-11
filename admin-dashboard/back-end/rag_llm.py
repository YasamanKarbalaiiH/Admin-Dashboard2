import json
import os
import chromadb
import requests
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from openai import OpenAI

# Load environment variables
load_dotenv()


gapgpt_api_key = os.getenv("GAPGPT_API_KEY")
db_path = os.getenv("DASHBOARD_DB_PATH")

if not gapgpt_api_key:
    raise ValueError("GAPGPT_API_KEY was not found in .env")



if not db_path:
    raise ValueError("DASHBOARD_DB_PATH was not found in .env")


# Initialize embedding model and vector database
embedding_model = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)


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
    documents = []
    metadatas = []
    ids = []

    def add_record(text, entity, record_id, **extra):
        documents.append(text.strip())

        metadata = {
            "entity": entity,
            "record_id": str(record_id)
        }

        for key, value in extra.items():
            metadata[key] = str(value)

        metadatas.append(metadata)
        ids.append(f"{entity}-{record_id}")

    # Customers
    for customer in database.get("customers", []):
        text = f"""
        Customer:
        Name: {customer.get('name', '')}
        Email: {customer.get('email', '')}
        Phone: {customer.get('phone', '')}
        Company: {customer.get('company', '')}
        Status: {customer.get('status', '')}
        Created At: {customer.get('createdAt', '')}
        """

        add_record(
            text,
            "customer",
            customer.get("id"),
            name=customer.get("name", ""),
            status=customer.get("status", "")
        )

    # Products
    for product in database.get("products", []):
        text = f"""
        Product:
        Name: {product.get('name', '')}
        Category: {product.get('category', '')}
        Price: {product.get('price', '')}
        Stock: {product.get('stock', '')}
        Status: {product.get('status', '')}
        """

        add_record(
            text,
            "product",
            product.get("id"),
            name=product.get("name", ""),
            category=product.get("category", "")
        )

    # Invoices
    for invoice in database.get("invoices", []):
        text = f"""
        Invoice:
        Invoice Number: {invoice.get('invoiceNumber', '')}
        Customer: {invoice.get('customer', '')}
        Date: {invoice.get('date', '')}
        Due Date: {invoice.get('dueDate', '')}
        Amount: {invoice.get('amount', '')}
        Status: {invoice.get('status', '')}
        """

        add_record(
            text,
            "invoice",
            invoice.get("id"),
            customer=invoice.get("customer", ""),
            status=invoice.get("status", "")
        )

    # Dashboard Statistics
    dashboard = database.get("dashboard", {})
    statistics = dashboard.get("statistics", {})

    if statistics:
        text = "Dashboard Statistics:\n"

        for key, value in statistics.items():
            text += f"{key}: {value}\n"

        add_record(
            text,
            "dashboard_statistics",
            "main"
        )

    # Monthly Revenue
    for index, revenue in enumerate(
        dashboard.get("revenue", [])
    ):
        text = f"""
        Monthly Revenue:
        Month: {revenue.get('month', '')}
        Revenue: {revenue.get('value', '')}
        """

        add_record(
            text,
            "revenue",
            index,
            month=revenue.get("month", "")
        )

    # Profile
    profile = database.get("profile", {})

    if profile:
        text = "Profile Information:\n"

        for key, value in profile.items():
            text += f"{key}: {value}\n"

        add_record(
            text,
            "profile",
            "main"
        )

    # Settings
    settings = database.get("settings", {})

    if settings:
        text = "Application Settings:\n"

        for key, value in settings.items():
            text += f"{key}: {value}\n"

        add_record(
            text,
            "settings",
            "main"
        )

    return documents, metadatas, ids



# Sync dashboard data with ChromaDB
def sync_database():

    database = load_database()

    documents, metadatas, ids = create_chunks(database)

    existing_data = collection.get()

    if existing_data["ids"]:
        collection.delete(ids=existing_data["ids"])

    embeddings = embedding_model.encode(
        documents
    ).tolist()

    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas
    )

sync_database()


# Send prompt to the Local LLM
def call_local_llm(prompt: str) -> str:
    url = "http://127.0.0.1:1234/v1/chat/completions"

    data = {
        "model": "gemma-4-e4b-it",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.1,
        "max_tokens": 100,
        "stream": False
    }

    response = requests.post(
        url,
        json=data,
        timeout=120
    )

    response.raise_for_status()

    result = response.json()
    answer = result["choices"][0]["message"]["content"].strip()

    if not answer:
        raise RuntimeError("Local LLM returned an empty response.")

    return answer




# Send prompt to the Gapgpt
def call_gapgpt(prompt: str) -> str:
    client = OpenAI(
        base_url="https://api.gapgpt.app/v1",
        api_key=gapgpt_api_key
    )

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
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
    prompt = f"""
Classify the question for a dashboard RAG system.

Return exactly one label:
rag
no_rag

Use rag for questions about dashboard data, customers,
products, invoices, revenue, or other stored records.

Use no_rag for general knowledge, programming,
or unrelated questions.

Question: {question}
Label:
"""

    decision = call_local_llm(prompt).strip().lower()

    if decision.startswith("rag"):
        return "rag"

    if decision.startswith("no_rag"):
        return "no_rag"

    return "rag"



# Retrieve relevant dashboard data
def retrieve(question: str) -> str:
    question_embedding = embedding_model.encode(
        [question]
    ).tolist()

    results = collection.query(
        query_embeddings=question_embedding
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

    return call_gapgpt(prompt)


# Generate an answer from retrieved context
def generate_answer(question: str, context: str) -> str:
    prompt = f"""
You are a data assistant for an admin dashboard.

Answer the question using only the information explicitly supported
by the provided context.

Rules:
1. Do not invent facts, numbers, dates, products, customers, or transactions.
2. Do not assume that a product or customer contributed to a revenue
   figure unless the context explicitly confirms it.
3. Distinguish between recorded facts and interpretations.
4. If the context does not contain enough information to answer part
   of the question, clearly state which information is missing.
5. If the question asks for an interpretation, explain only what the
   available data supports. Do not make unsupported causal claims.
6. Answer in the same language as the question.
7. Be clear, concise, and direct.
8. Never fill missing information with guesses.

Context:
{context}

Question:
{question}

Answer:
"""

    return call_local_llm(prompt)


# Check whether retrieved context is relevant

def grade_retrieval(question: str, context: str) -> str:
    
    prompt = f"""
    You are evaluating retrieved context for a dashboard RAG system.

    Your task is to determine whether the context contains enough
    information to answer the user's question.

    Use the following labels:

    correct:
    The context contains all necessary information to answer
    the question, including information needed for comparisons,
    calculations, and finding maximum or minimum values.

    ambiguous:
    The context contains some relevant information, but one or
    more necessary facts are missing or the available records
    are insufficient to determine the answer.

    incorrect:
    The context contains no relevant information that helps
    answer the question.

    Important instructions:
    - Read the question carefully.
    - Find the relevant information in the context.
    - Use the actual values provided in the context.
    - You may compare values and perform calculations.
    - Do not assume that information is missing if it is
    explicitly available in the context.
    - Do not confuse irrelevant information with missing information.
    - Evaluate the evidence, not the answer itself.

    Question:
    {question}

    Retrieved Context:
    {context}

    Return exactly one word:
    correct
    ambiguous
    incorrect

    Label:
    """


    decision = call_local_llm(prompt).strip().lower()

    # Extract a recognized label from the model response.
    for word in decision.replace(".", " ").split():
        label = word.strip("`'\"():,;")
        if label in {"correct", "ambiguous", "incorrect"}:
            return label

    return "ambiguous"




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

    return call_gapgpt(prompt).strip()


# Run the Corrective RAG pipeline

def corrective_rag(question: str) -> str:

    # Step 1: Retrieve initial context
    initial_context = retrieve(question)

    print("\n--- INITIAL CONTEXT ---")
    print(initial_context)

    # Step 2: Evaluate initial context
    initial_grade = grade_retrieval(
        question,
        initial_context
    )

    print("Initial grade:", initial_grade)

    # Step 3: Use initial context if sufficient
    if initial_grade == "correct":
        return generate_answer(
            question,
            initial_context
        )

    # Step 4: Rewrite the question
    rewritten_query = rewrite_query(question)

    print("Rewritten query:", rewritten_query)

    # Step 5: Retrieve using rewritten query
    corrected_context = retrieve(rewritten_query)

    print("\n--- CORRECTED CONTEXT ---")
    print(corrected_context)

    # Step 6: Evaluate corrected context
    corrected_grade = grade_retrieval(
        question,
        corrected_context
    )

    print("Corrected grade:", corrected_grade)

    # Step 7: Use corrected context if sufficient
    if corrected_grade == "correct":
        return generate_answer(
            question,
            corrected_context
        )

    # Step 8: Combine contexts if either is ambiguous
    if (
        initial_grade == "ambiguous"
        or corrected_grade == "ambiguous"
    ):
        combined_context = (
            initial_context
            + "\n\n"
            + corrected_context
        )

        combined_grade = grade_retrieval(
            question,
            combined_context
        )

        print("Combined grade:", combined_grade)

        if combined_grade == "correct":
            return generate_answer(
                question,
                combined_context
            )

    # Step 9: Return fallback response
    return "NO INFORMATION AVAILABLE!!!"


# Run the Adaptive RAG pipeline

def ask_rag(question: str) -> str:

    decision = route_question(question)

    if decision == "no_rag":
        return answer_without_rag(question)

    print("rag")

    return corrective_rag(question)

