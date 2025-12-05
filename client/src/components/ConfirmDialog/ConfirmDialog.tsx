import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Yes",
  cancelText = "No",
  confirmButtonClass = "bg-red-600 hover:bg-red-700",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60' onClick={onCancel} />

      {/* Dialog */}
      <div className='relative z-10 w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl'>
        {/* Close button */}
        <button onClick={onCancel} className='absolute top-4 right-4 text-gray-400 transition-colors hover:text-white'>
          <X className='h-5 w-5' />
        </button>

        {/* Content */}
        <h3 className='mb-4 text-xl font-semibold text-white'>{title}</h3>
        <p className='mb-6 text-gray-300'>{message}</p>

        {/* Buttons */}
        <div className='flex justify-end gap-3'>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className='rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-6 py-2 text-white transition-colors disabled:opacity-50 ${confirmButtonClass}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
