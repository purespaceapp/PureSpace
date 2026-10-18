
"use client";

import { useState, type FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = input.trim();
    if (!content || loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];

    setMessages(updatedMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in to use PureSpace AI.");
        }
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to contact the assistant."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto flex min-h-[85vh] max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-white p-6">
          <a
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to PureSpace
          </a>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
              ✨
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                PureSpace AI
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Your cleaning operations assistant
              </p>
            </div>
          </div>
        </header>

        <section
          aria-live="polite"
          className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-8"
        >
          {messages.length === 0 && (
            <div className="mx-auto max-w-xl py-10 text-center">
              <div className="mb-4 text-4xl">✨</div>
              <h2 className="text-xl font-semibold">
                How can I help you today?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ask questions about cleaning operations, schedules, inventory,
                maintenance, reports, or billing.
              </p>

              <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
                {[
                  "Help me organize today's cleaning schedule.",
                  "Create an inventory checklist.",
                  "Help me write a message to a property owner.",
                  "How should I prepare a cleaning report?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setInput(suggestion)}
                    className="rounded-xl border border-slate-200 p-4 text-sm transition hover:border-emerald-400 hover:bg-emerald-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "rounded-br-md bg-emerald-700 text-white"
                    : "rounded-bl-md bg-slate-100 text-slate-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <p className="text-sm text-slate-500" role="status">
              PureSpace AI is thinking…
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </section>

        <form
          onSubmit={sendMessage}
          className="border-t border-slate-200 bg-white p-4 sm:p-6"
        >
          <div className="flex items-end gap-3">
            <label className="sr-only" htmlFor="ai-message">
              Your message
            </label>
            <textarea
              id="ai-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Ask PureSpace AI anything…"
              rows={2}
              maxLength={3000}
              disabled={loading}
              className="min-h-14 flex-1 resize-y rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-2xl bg-emerald-700 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            AI responses can be inaccurate. Review important information before
            making operational or billing decisions.
          </p>
        </form>
      </div>
    </main>
  );
}
