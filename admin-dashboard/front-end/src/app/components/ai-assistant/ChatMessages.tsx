import { Bot, User } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatMessagesProps = {
  messages: Message[];
  loading: boolean;
};

export default function ChatMessages({ messages, loading }: ChatMessagesProps) {
  return (
    <div className="flex-1 space-y-5 overflow-y-auto p-6">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex gap-3 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {message.role === "assistant" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot size={18} />
            </div>
          )}

          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
              message.role === "user"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {message.role === "user" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <User size={18} />
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot size={18} />
          </div>

          <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
            Thinking...
          </div>
        </div>
      )}
    </div>
  );
}
