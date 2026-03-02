import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, X, Send, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

import { chatbotApi, type ChatbotSuggestion } from "@/shared/lib/chatbotApi";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";

type ChatRole = "user" | "bot";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  source?: string;
}

function renderMarkdownBasic(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\n/g, "<br />");

  return html;
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ChatbotSuggestion[]>([]);

  useEffect(() => {
    chatbotApi
      .getSuggestions()
      .then(setSuggestions)
      .catch(() => {
        // ignore error, suggestions are optional
      });
  }, []);

  const handleSend = async (question?: string) => {
    const content = (question ?? input).trim();
    if (!content || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    if (!question) {
      setInput("");
    }

    try {
      setLoading(true);
      const answer = await chatbotApi.ask(content);
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "bot",
        content: answer.answer,
        source: answer.source,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      console.error("Chatbot error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể kết nối chatbot. Vui lòng thử lại sau.";
      toast.error(message);
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "bot",
        content: message,
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  const quickSuggestions = useMemo(
    () => suggestions.slice(0, 4),
    [suggestions],
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-40 w-full max-w-sm md:max-w-md"
          >
            <div className="rounded-2xl border bg-card shadow-2xl shadow-teal-900/20 overflow-hidden flex flex-col h-[420px]">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      360Retail Assistant
                    </span>
                    <span className="text-[11px] opacity-90">
                      Hỏi về giá, tính năng, gói dịch vụ
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 hover:bg-white/10 transition-colors"
                  aria-label="Đóng chatbot"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
                  {!hasMessages && (
                    <div className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                      Bắt đầu bằng cách chọn một câu hỏi gợi ý bên dưới hoặc gõ câu
                      hỏi của bạn về gói Trial, Basic, Pro, Yearly, thanh toán, v.v.
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-teal-600 text-white rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        {msg.role === "bot" ? (
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdownBasic(msg.content),
                            }}
                          />
                        ) : (
                          <span>{msg.content}</span>
                        )}
                        {msg.role === "bot" && msg.source && (
                          <div className="mt-1 text-[10px] opacity-70">
                            Nguồn: {msg.source === "faq" ? "FAQ" : "AI"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                      <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                      Đang soạn câu trả lời...
                    </div>
                  )}
                </div>

                {quickSuggestions.length > 0 && (
                  <div className="border-t px-3 py-2 flex flex-wrap gap-2">
                    {quickSuggestions.map((sugg) => (
                      <button
                        key={sugg.question}
                        type="button"
                        onClick={() => handleSend(sugg.question)}
                        className="rounded-full border px-3 py-1 text-[11px] text-muted-foreground hover:bg-muted/80 transition-colors"
                      >
                        {sugg.text}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSend();
                  }}
                  className="border-t px-3 py-2 flex items-end gap-2 bg-background"
                >
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={2}
                    placeholder="Hỏi về giá gói, tính năng, dùng thử..."
                    className="resize-none text-sm max-h-20"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={loading || !input.trim()}
                    className="h-9 w-9 rounded-full bg-teal-600 hover:bg-teal-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-lg shadow-teal-900/30 hover:shadow-xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Mở chatbot 360Retail"
      >
        <MessageCircle className="h-5 w-5" />
      </motion.button>
    </>
  );
}

