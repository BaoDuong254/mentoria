import { useState } from "react";
import { Bot } from "lucide-react";
import ChatbotModal from "@/components/ChatbotModal";

export default function ChatbotFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(true);
        }}
        className='group fixed right-6 bottom-6 z-40 flex cursor-pointer items-center rounded-full bg-linear-to-r from-blue-500 to-blue-600 p-4 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl'
        title='Open AI Assistant'
      >
        <Bot className='h-6 w-6' />
        <span className='max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:ml-1 group-hover:max-w-xs'>
          Ask AI
        </span>
      </button>

      {/* Chatbot Modal */}
      <ChatbotModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </>
  );
}
