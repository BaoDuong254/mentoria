import { useState } from "react";
import { X } from "lucide-react";

interface ComplaintModalProps {
  isOpen: boolean;
  mentorName: string;
  meetingId: number;
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ComplaintModal({
  isOpen,
  mentorName,
  onSubmit,
  onCancel,
  isLoading = false,
}: ComplaintModalProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Please enter your complaint content");
      return;
    }

    if (content.trim().length < 10) {
      setError("Complaint must be at least 10 characters");
      return;
    }

    setError("");
    await onSubmit(content.trim());
    setContent("");
  };

  const handleCancel = () => {
    setContent("");
    setError("");
    onCancel();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60' onClick={handleCancel} />

      {/* Dialog */}
      <div className='relative z-10 w-full max-w-lg rounded-lg bg-gray-800 p-6 shadow-xl'>
        {/* Close button */}
        <button
          onClick={handleCancel}
          className='absolute top-4 right-4 text-gray-400 transition-colors hover:text-white'
        >
          <X className='h-5 w-5' />
        </button>

        {/* Content */}
        <h3 className='mb-2 text-xl font-semibold text-white'>File a Complaint</h3>
        <p className='mb-4 text-sm text-gray-400'>
          Submit a complaint about mentor <span className='font-medium text-cyan-400'>{mentorName}</span> not accepting
          your booking request within the required time.
        </p>

        {/* Textarea */}
        <div className='mb-4'>
          <label className='mb-2 block text-sm font-medium text-gray-300'>Complaint Details</label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
            }}
            placeholder='Please describe your complaint in detail...'
            rows={5}
            className='w-full resize-none rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none'
            disabled={isLoading}
          />
          {error && <p className='mt-1 text-sm text-red-400'>{error}</p>}
          <p className='mt-1 text-xs text-gray-500'>{content.length} characters (minimum 10)</p>
        </div>

        {/* Info box */}
        <div className='mb-6 rounded-lg bg-gray-700/50 p-4 text-sm text-gray-300'>
          <p className='mb-1 font-medium text-yellow-400'>⚠️ Note:</p>
          <ul className='list-inside list-disc space-y-1 text-gray-400'>
            <li>Your complaint will be reviewed by our admin team</li>
            <li>You will be notified of the resolution</li>
            <li>Refunds may be processed if your complaint is valid</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className='flex justify-end gap-3'>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className='rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={isLoading || !content.trim()}
            className='rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50'
          >
            {isLoading ? "Submitting..." : "Submit Complaint"}
          </button>
        </div>
      </div>
    </div>
  );
}
