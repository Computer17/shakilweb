import React, { useState, useEffect, useRef } from 'react';
import { ServiceItem } from '../../types';
import {
  Bot,
  Send,
  User,
  Sparkles,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface AiClientAssistantProps {
  service: ServiceItem;
  onProceedToOrderWithContext?: (summary: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isUncertain?: boolean;
}

export const AiClientAssistant: React.FC<AiClientAssistantProps> = ({
  service,
  onProceedToOrderWithContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto Greeting on mount or service change
  useEffect(() => {
    const greetingText = `Assalamu Alaikum! 👋

Welcome to the **${service.title}** service on Shakil WorkHub.

Here you can learn exactly what this service includes, what information or files you need to provide, how the work process works, and how pricing is determined.

💡 **Important Note**: Your work will be reviewed before acceptance. Please allow approximately **10–15 minutes** after submitting your request.

If you have any questions or need help preparing your order, feel free to ask me in **English or Bengali**!`;

    setMessages([
      {
        id: 'greet-1',
        sender: 'ai',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [service]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userMsgText,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceTitle: service.title,
          userMessage: userMsgText,
          conversationHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: data.reply || 'I am ready to help you prepare your order.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUncertain: data.isUncertain,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-err-' + Date.now(),
          sender: 'ai',
          text: 'Assalamu Alaikum! I am currently assisting via standard rule mode. Your order request will be reviewed within 10–15 minutes after submission.',
          timestamp: now,
          isUncertain: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Build order context summary from chat
  const handleProceedOrder = () => {
    const userTexts = messages
      .filter((m) => m.sender === 'user')
      .map((m) => m.text)
      .join('; ');

    const summaryText = userTexts
      ? `Discussed requirements for ${service.title}: "${userTexts}"`
      : `Client initiated order for ${service.title} after consulting WorkHub AI Assistant.`;

    if (onProceedToOrderWithContext) {
      onProceedToOrderWithContext(summaryText);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-xl space-y-4">
      {/* Assistant Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>WorkHub Service Assistant</span>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                AI Powered
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Ask questions in English or বাংলা</p>
          </div>
        </div>

        <button
          onClick={handleProceedOrder}
          className="text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
        >
          Proceed to Order →
        </button>
      </div>

      {/* Messages List Container */}
      <div className="h-64 sm:h-80 overflow-y-auto space-y-3 pr-1 text-xs sm:text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Uncertain Escalation Buttons */}
              {msg.isUncertain && (
                <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2">
                  <p className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Direct Admin Review Recommended:</span>
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={`https://wa.me/?text=Hello%20Shakil,%20I%20have%20a%20question%20about%20${encodeURIComponent(
                        service.title
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-600/50"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>WhatsApp Admin</span>
                    </a>

                    <a
                      href={`https://t.me/share/url?url=https://workhub.app&text=Hello%20Shakil%20question%20about%20${encodeURIComponent(
                        service.title
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600/30 border border-sky-500/40 px-2.5 py-1 text-[11px] font-semibold text-sky-300 hover:bg-sky-600/50"
                    >
                      <Send className="h-3 w-3" />
                      <span>Telegram Admin</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic">
            <Bot className="h-4 w-4 animate-bounce text-cyan-400" />
            <span>AI Assistant is reading requirements...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          placeholder="Type your question about this service (English/বাংলা)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-50 transition-colors shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
