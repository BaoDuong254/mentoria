import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Loader2 } from "lucide-react";
import { sendChatMessage } from "@/apis/chatbot.api";
import type { ChatMessage } from "@/types/chatbot.type";
import { useAuthStore } from "@/store/useAuthStore";

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "model",
          content:
            "Hi! I'm your AI assistant for Mentoria. I can help you find mentors, check your meetings, and answer questions about the platform. How can I assist you today?",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setError(null);

    // Add user message to chat
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Send message to API
      // Filter out the initial welcome message (role: model at index 0) to avoid API errors
      const filteredHistory = messages.filter((msg, index) => !(index === 0 && msg.role === "model"));

      const response = await sendChatMessage({
        message: userMessage,
        history: filteredHistory,
        userId: user?.user_id,
        userRole: user?.role as "Mentee" | "Mentor" | "Admin" | undefined,
      });

      if (response.success && response.response) {
        // Add bot response to chat
        setMessages([...newMessages, { role: "model", content: response.response }]);
      } else {
        setError(response.message || "Failed to get response from chatbot");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("An error occurred while communicating with the chatbot. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "model",
        content:
          "Hi! I'm your AI assistant for Mentoria. I can help you find mentors, check your meetings, and answer questions about the platform. How can I assist you today?",
      },
    ]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className='pointer-events-none fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6'>
      {/* Modal */}
      <div className='animate-slide-up pointer-events-auto relative z-10 flex max-h-150 w-full max-w-md flex-col rounded-lg bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-linear-to-r from-blue-500 to-blue-600 p-4 text-white'>
          <div className='flex items-center gap-3'>
            <div className='rounded-full bg-white/20 p-2'>
              <Bot className='h-5 w-5' />
            </div>
            <div>
              <h2 className='text-lg font-semibold'>AI Assistant</h2>
              <p className='text-xs opacity-90'>Powered by Google Gemini</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={clearChat}
              className='hover:bg-opacity-20 cursor-pointer rounded-full p-2 transition-colors hover:bg-white/20'
              title='Clear chat'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className='hover:bg-opacity-20 cursor-pointer rounded-full p-2 transition-colors hover:bg-white/20'
              title='Close'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className='flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4'>
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "rounded-br-none bg-blue-500 text-white"
                    : "rounded-bl-none border border-gray-200 bg-white text-gray-800 shadow-sm"
                }`}
              >
                <p className='text-sm wrap-break-word whitespace-pre-wrap'>{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className='flex justify-start'>
              <div className='rounded-lg rounded-bl-none border border-gray-200 bg-white px-4 py-2 text-gray-800 shadow-sm'>
                <div className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span className='text-sm'>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className='flex justify-center'>
              <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700'>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className='rounded-b-lg border-t border-gray-200 bg-white p-4'>
          <div className='flex gap-2'>
            <input
              type='text'
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder='Type your message...'
              disabled={isLoading}
              className='flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100'
            />
            <button
              onClick={() => {
                void handleSendMessage();
              }}
              disabled={!inputMessage.trim() || isLoading}
              title='Send message'
              className='flex cursor-pointer items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300'
            >
              <Send className='h-4 w-4' />
            </button>
          </div>
          <p className='mt-2 text-center text-xs text-gray-500'>AI can make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  );
}
