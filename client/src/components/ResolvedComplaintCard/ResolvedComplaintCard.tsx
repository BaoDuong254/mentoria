import { Calendar, Clock, CheckCircle, MessageSquare } from "lucide-react";
import type { ComplaintResponse } from "@/types/complaint.type";

interface ResolvedComplaintCardProps {
  complaint: ComplaintResponse;
}

export default function ResolvedComplaintCard({ complaint }: ResolvedComplaintCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      return `${String(hour12)}:${String(minutes).padStart(2, "0")} ${ampm}`;
    }
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${String(hour12)}:${minutes} ${ampm}`;
  };

  return (
    <div className='w-full rounded-lg bg-gray-800 p-4 outline-1 -outline-offset-1 outline-emerald-600'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <img
            src={complaint.mentor_avatar_url ?? "https://i.pravatar.cc/150"}
            alt={`${complaint.mentor_first_name} ${complaint.mentor_last_name}`}
            className='h-12 w-12 rounded-full object-cover'
          />
          <div>
            <h3 className='text-base font-medium text-white'>
              {complaint.mentor_first_name} {complaint.mentor_last_name}
            </h3>
            <p className='text-sm text-gray-400'>Complaint Resolved</p>
          </div>
        </div>
        <span className='flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs text-emerald-100'>
          <CheckCircle className='h-3 w-3' />
          Resolved
        </span>
      </div>

      {/* Original Complaint */}
      <div className='mb-4 rounded-lg bg-gray-700/50 p-3'>
        <div className='mb-2 flex items-center gap-2 text-sm text-gray-400'>
          <MessageSquare className='h-4 w-4' />
          <span>Your Complaint</span>
        </div>
        <p className='text-sm text-gray-300'>{complaint.content}</p>
      </div>

      {/* Admin Response */}
      {complaint.admin_response && (
        <div className='mb-4 rounded-lg border border-emerald-700/50 bg-emerald-900/30 p-3'>
          <div className='mb-2 flex items-center gap-2 text-sm text-emerald-400'>
            <CheckCircle className='h-4 w-4' />
            <span>Admin Response</span>
          </div>
          <p className='text-sm text-emerald-100'>{complaint.admin_response}</p>
        </div>
      )}

      {/* Meeting Info */}
      <div className='mb-4 flex items-center gap-6 text-sm text-gray-400'>
        <div className='flex items-center gap-2'>
          <Calendar className='h-3.5 w-3.5' />
          <span>{formatDate(complaint.meeting_date)}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Clock className='h-3.5 w-3.5' />
          <span>
            {formatTime(complaint.meeting_start_time)} - {formatTime(complaint.meeting_end_time)}
          </span>
        </div>
      </div>

      {/* Resolved Date */}
      <div className='text-xs text-gray-500'>Resolved on {formatDate(complaint.updated_at)}</div>
    </div>
  );
}
