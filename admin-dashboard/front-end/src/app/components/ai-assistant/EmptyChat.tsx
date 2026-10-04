import { Bot } from "lucide-react";

export default function EmptyChat() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bot size={28} />
      </div>

      <h2 className="text-lg font-semibold text-gray-800">
        How can I help you?
      </h2>

      <p className="mt-2 max-w-md text-sm text-gray-500">
        Ask me anything about the information available in the company
        documents.
      </p>
    </div>
  );
}
