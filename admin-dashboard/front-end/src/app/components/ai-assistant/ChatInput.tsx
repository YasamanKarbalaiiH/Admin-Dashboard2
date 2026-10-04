import { Send } from "lucide-react";

type ChatInputProps = {
  question: string;
  loading: boolean;
  onQuestionChange: (question: string) => void;
  onSend: () => void;
};

export default function ChatInput({
  question,
  loading,
  onQuestionChange,
  onSend,
}: ChatInputProps) {
  return (
    <div className="border-t p-4">
      <div className="flex gap-3">
        <input
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSend();
            }
          }}
          placeholder="Ask a question..."
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-primary"
        />

        <button
          onClick={onSend}
          disabled={loading || !question.trim()}
          className="flex items-center justify-center rounded-xl bg-primary px-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
