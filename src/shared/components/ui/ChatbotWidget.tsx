import { useEffect, useMemo, useRef, useState } from "react";
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

const CHAT_STORAGE_KEY = "360retail-chatbot-messages";

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
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Khôi phục lịch sử chat từ localStorage (nếu có)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed)) {
        setMessages(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Lưu lịch sử chat mỗi khi messages thay đổi
  useEffect(() => {
    try {
      if (messages.length === 0) {
        localStorage.removeItem(CHAT_STORAGE_KEY);
      } else {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {
      // ignore storage errors
    }
  }, [messages]);

  useEffect(() => {
    chatbotApi
      .getSuggestions()
      .then(setSuggestions)
      .catch(() => {
        // ignore error, suggestions are optional
      });
  }, []);

  // Tự scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (!open) return;
    if (messagesContainerRef.current) {
      const el = messagesContainerRef.current;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, open]);

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

  const handleClear = () => {
    setMessages([]);
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // ignore
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
            className="fixed bottom-28 right-6 z-40 w-full max-w-md md:max-w-lg"
          >
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 shadow-[0_20px_60px_rgba(8,47,73,0.8)] overflow-hidden flex flex-col h-[500px] backdrop-blur-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/15 shadow-inner">
                    <Bot className="h-4 w-4 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm md:text-base font-semibold leading-tight">
                      360Retail Assistant
                    </span>
                    <span className="text-[11px] md:text-xs opacity-90">
                      Hỏi về giá, tính năng, gói dịch vụ 360Retail
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 hover:bg-white/15 transition-colors"
                  aria-label="Đóng chatbot"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 flex flex-col min-h-0 bg-slate-950/60">
                <div
                  ref={messagesContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                >
                  {!hasMessages && (
                    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-3 text-xs md:text-sm text-slate-300">
                      Bắt đầu bằng cách chọn một câu hỏi gợi ý bên dưới hoặc gõ câu hỏi
                      của bạn về gói Trial, Basic, Pro, Yearly, thanh toán, v.v.
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
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-teal-600 text-white rounded-br-sm shadow-[0_0_18px_rgba(45,212,191,0.4)]"
                            : "bg-slate-900/90 text-slate-50 border border-slate-800 rounded-bl-sm"
                        }`}
                      >
                        {msg.role === "bot" ? (
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none [&_strong]:text-amber-300"
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

                {hasMessages && (
                  <div className="px-4 pt-1 pb-3 text-right">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-[11px] md:text-xs text-slate-400 hover:text-slate-200 hover:underline"
                    >
                      Xóa cuộc trò chuyện này
                    </button>
                  </div>
                )}

                {quickSuggestions.length > 0 && (
                  <div className="border-t border-slate-800 px-4 py-3 flex flex-wrap gap-2 bg-slate-950/60">
                    {quickSuggestions.map((sugg) => (
                      <button
                        key={sugg.question}
                        type="button"
                        onClick={() => handleSend(sugg.question)}
                        className="rounded-full border border-slate-700 px-3 py-1.5 text-[11px] md:text-xs text-slate-200 bg-slate-900/70 hover:bg-slate-800 hover:border-teal-500 transition-colors"
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
                  className="border-t border-slate-800 px-4 py-3 flex items-end gap-2 bg-slate-950/95"
                >
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={2}
                    placeholder="Hỏi về giá gói, tính năng, dùng thử..."
                    className="resize-none text-sm max-h-24 bg-slate-900/80 border-slate-700 focus-visible:ring-teal-500"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={loading || !input.trim()}
                    className="h-10 w-10 rounded-full bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/40"
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
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-lg shadow-teal-900/40 hover:shadow-2xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Mở chatbot 360Retail"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>
    </>
  );
}

