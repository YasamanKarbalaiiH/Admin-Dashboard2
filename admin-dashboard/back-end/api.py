from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag import ask_rag

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    question: str



@app.get("/")
def home():
    return {
        "message": "RAG API is running"
    }



@app.post("/ask")
def ask_question(data: Question):

    answer = ask_rag(
        data.question
    )

    return {
        "answer": answer
    }