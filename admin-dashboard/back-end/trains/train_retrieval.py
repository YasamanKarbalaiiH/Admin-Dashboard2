import json
import joblib

from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split


with open("retrieval_dataset.json", "r", encoding="utf-8") as file:
    data = json.load(file)


texts = [
    f"Question: {item['question']}\nContext: {item['context']}"
    for item in data
]

labels = [item["label"] for item in data]


embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

embeddings = embedding_model.encode(texts)


X_train, X_test, y_train, y_test = train_test_split(
    embeddings,
    labels,
    test_size=0.2,
    random_state=42,
    stratify=labels
)


classifier = LogisticRegression(max_iter=1000)

classifier.fit(X_train, y_train)


predictions = classifier.predict(X_test)

print(classification_report(y_test, predictions))


joblib.dump(classifier, "retrieval_model.pkl")

print("Retrieval model saved.")