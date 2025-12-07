import { Calendar, Clock, AlertTriangle, MessageSquare, User } from "lucide-react";
import type { ComplaintResponse } from "@/types/complaint.type";

interface ComplaintedMeetingCardProps {
  complaint: ComplaintResponse;
}

export default function ComplaintedMeetingCard({ complaint }: ComplaintedMeetingCardProps) {
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

  const getStatusColor = () => {
    switch (complaint.status) {
      case "Pending":
        return "bg-yellow-600 text-yellow-100";
      case "Reviewed":
        return "bg-blue-600 text-blue-100";
      case "Resolved":
        return "bg-emerald-600 text-emerald-100";
      case "Rejected":
        return "bg-gray-600 text-gray-100";
      default:
        return "bg-red-600 text-red-100";
    }
  };

  return (
    <div className='w-full rounded-lg bg-gray-800 p-4 outline-1 -outline-offset-1 outline-red-600'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <img
            src={complaint.mentee_avatar_url ?? "https://i.pravatar.cc/150"}
            alt={`${complaint.mentee_first_name} ${complaint.mentee_last_name}`}
            className='h-12 w-12 rounded-full object-cover'
          />
          <div>
            <h3 className='text-base font-medium text-white'>
              {complaint.mentee_first_name} {complaint.mentee_last_name}
            </h3>
            <p className='text-sm text-gray-400'>{complaint.mentee_email}</p>
          </div>
        </div>
        <div className='flex flex-col items-end gap-2'>
          <span className='flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs text-red-100'>
            <AlertTriangle className='h-3 w-3' />
            Be Complained
          </span>
          <span className={`rounded-full px-3 py-1 text-xs ${getStatusColor()}`}>{complaint.status}</span>
        </div>
      </div>

      {/* Complaint Content */}
      <div className='mb-4 rounded-lg border border-red-700/50 bg-red-900/20 p-3'>
        <div className='mb-2 flex items-center gap-2 text-sm text-red-400'>
          <MessageSquare className='h-4 w-4' />
          <span>Complaint from Mentee</span>
        </div>
        <p className='text-sm text-red-100'>{complaint.content}</p>
      </div>

      {/* Admin Response (if any) */}
      {complaint.admin_response && (
        <div className='mb-4 rounded-lg border border-blue-700/50 bg-blue-900/20 p-3'>
          <div className='mb-2 flex items-center gap-2 text-sm text-blue-400'>
            <User className='h-4 w-4' />
            <span>Admin Response</span>
          </div>
          <p className='text-sm text-blue-100'>{complaint.admin_response}</p>
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

      {/* Complaint Date */}
      <div className='text-xs text-gray-500'>Complained on {formatDate(complaint.created_at)}</div>
    </div>
  );
}
