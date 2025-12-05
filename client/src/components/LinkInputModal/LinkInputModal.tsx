import { useState } from "react";
import { X, Link as LinkIcon } from "lucide-react";

interface LinkInputModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  initialValue?: string;
  submitText?: string;
  onSubmit: (link: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function LinkInputModalContent({
  title,
  description,
  placeholder = "https://meet.google.com/xxx-xxxx-xxx",
  initialValue = "",
  submitText = "Save",
  onSubmit,
  onCancel,
  isLoading = false,
}: Omit<LinkInputModalProps, "isOpen">) {
  const [link, setLink] = useState(initialValue);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!link.trim()) {
      setError("Please enter a valid link");
      return;
    }

    // Basic URL validation
    try {
      new URL(link);
      setError("");
      onSubmit(link);
    } catch {
      setError("Please enter a valid URL");
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60' onClick={onCancel} />

      {/* Dialog */}
      <div className='relative z-10 w-full max-w-lg rounded-lg bg-gray-800 p-6 shadow-xl'>
        {/* Close button */}
        <button onClick={onCancel} className='absolute top-4 right-4 text-gray-400 transition-colors hover:text-white'>
          <X className='h-5 w-5' />
        </button>

        {/* Content */}
        <div className='mb-4 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-cyan-700'>
            <LinkIcon className='h-5 w-5 text-white' />
          </div>
          <h3 className='text-xl font-semibold text-white'>{title}</h3>
        </div>

        {description && <p className='mb-4 text-gray-400'>{description}</p>}

        {/* Input */}
        <div className='mb-4'>
          <input
            type='url'
            placeholder={placeholder}
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setError("");
            }}
            className='w-full rounded-lg bg-gray-700 px-4 py-3 text-white ring-1 ring-gray-600 outline-none focus:ring-cyan-700'
          />
          {error && <p className='mt-2 text-sm text-red-400'>{error}</p>}
        </div>

        {/* Buttons */}
        <div className='flex justify-end gap-3'>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className='rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className='rounded-lg bg-cyan-700 px-6 py-2 text-white transition-colors hover:bg-cyan-600 disabled:opacity-50'
          >
            {isLoading ? "Saving..." : submitText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LinkInputModal({ isOpen, ...props }: LinkInputModalProps) {
  if (!isOpen) return null;

  // Using key={Date.now()} or just remounting on isOpen ensures fresh state
  return <LinkInputModalContent {...props} />;
}
