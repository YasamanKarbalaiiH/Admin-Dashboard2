import { Bot } from "lucide-react";

export default function ChatHeader() {
  return (
    <div className="border-b px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bot size={20} />
        </div>

        <div>
          <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>

          <p className="text-xs text-gray-500">Company information assistant</p>
        </div>
      </div>
    </div>
  );
}
