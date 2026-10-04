"use client";

import { useState } from "react";

import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import EmptyChat from "./EmptyChat";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function askQuestion() {
    if (!question.trim() || loading) {
      return;
    }

    const userQuestion = question.trim();

    setQuestion("");

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch {
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content: "Unable to connect to the RAG server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col p-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
        <ChatHeader />

        <div className="flex min-h-0 flex-1 flex-col">
          {messages.length === 0 ? (
            <EmptyChat />
          ) : (
            <ChatMessages messages={messages} loading={loading} />
          )}

          <ChatInput
            question={question}
            loading={loading}
            onQuestionChange={setQuestion}
            onSend={askQuestion}
          />
        </div>
      </div>
    </div>
  );
}
