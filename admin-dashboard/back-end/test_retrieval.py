import joblib

from sentence_transformers import SentenceTransformer


embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

classifier = joblib.load("retrieval_model.pkl")


tests = [
    {
        "question": "How many customers are there?",
        "context": "Dashboard Statistics: Total Customers: 125",
        "expected": "relevant",
    },
    {
        "question": "How many customers are there?",
        "context": "Product: iPhone 16 Pro, Price: 999, Stock: 12",
        "expected": "not_relevant",
    },
    {
        "question": "مجموع درآمد چقدره؟",
        "context": "Dashboard Statistics: Total Revenue: 245000",
        "expected": "relevant",
    },
    {
        "question": "مجموع درآمد چقدره؟",
        "context": "Product: iPhone 16 Pro, Price: 999, Stock: 12",
        "expected": "not_relevant",
    },
    {
        "question": "What is the phone number for John Smith?",
        "context": "Customer: John Smith, Phone: 09121234567",
        "expected": "relevant",
    },
    {
        "question": "What is the phone number for John Smith?",
        "context": "Invoice: INV-1001, Customer: Sarah Johnson, Status: Paid",
        "expected": "not_relevant",
    },
    {
        "question": "How many invoices are pending?",
        "context": "Invoice: INV-1005, Status: Pending",
        "expected": "relevant",
    },
    {
        "question": "How many invoices are pending?",
        "context": "Dashboard Statistics: Total Products: 48",
        "expected": "not_relevant",
    },
]


for index, test in enumerate(tests, start=1):

    text = (
        f"Question: {test['question']}\n"
        f"Context: {test['context']}"
    )

    embedding = embedding_model.encode([text])

    prediction = classifier.predict(embedding)[0]

    probabilities = classifier.predict_proba(embedding)[0]

    classes = classifier.classes_

    probability_map = dict(zip(classes, probabilities))

    print(f"\nTest {index}")
    print(f"Question: {test['question']}")
    print(f"Context: {test['context']}")
    print(f"Expected: {test['expected']}")
    print(f"Predicted: {prediction}")
    print(
        f"Probability - relevant: "
        f"{probability_map.get('relevant', 0):.2f}"
    )
    print(
        f"Probability - not_relevant: "
        f"{probability_map.get('not_relevant', 0):.2f}"
    )

    if prediction == test["expected"]:
        print("Result: CORRECT")
    else:
        print("Result: WRONG")