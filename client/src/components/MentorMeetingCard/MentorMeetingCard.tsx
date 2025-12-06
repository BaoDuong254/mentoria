import { Calendar, Clock, Video, Check, Link as LinkIcon, UserCheck, MessageCircle } from "lucide-react";
import type { MeetingResponse } from "@/types/meeting.type";
import { useMeetingStore } from "@/store/useMeetingStore";
import { useState } from "react";
import LinkInputModal from "@/components/LinkInputModal";

interface MentorMeetingCardProps {
  meeting: MeetingResponse;
  type: "accepted" | "completed" | "pending";
}

export default function MentorMeetingCard({ meeting, type }: MentorMeetingCardProps) {
  const { setMeetingLocation, markMeetingAsCompleted, setReviewLink, acceptMeeting } = useMeetingStore();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showReviewLinkModal, setShowReviewLinkModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    // Handle ISO datetime format: "2025-12-01T09:00:00.000Z"
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      return `${String(hour12)}:${String(minutes).padStart(2, "0")} ${ampm}`;
    }
    // Handle time format: "09:00:00" or "09:00"
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${String(hour12)}:${minutes} ${ampm}`;
  };

  const handleEditLink = () => {
    setShowLinkModal(true);
  };

  const handleSaveLink = async (link: string) => {
    setIsUpdating(true);
    const success = await setMeetingLocation(meeting.meeting_id, link);
    setIsUpdating(false);
    if (success) {
      setShowLinkModal(false);
    } else {
      alert("Failed to save meeting link");
    }
  };

  const handleJoinMeeting = () => {
    if (meeting.location) {
      window.open(meeting.location, "_blank");
    } else {
      alert("Please add a meeting link first");
    }
  };

  const handleMarkCompleted = async () => {
    setIsMarkingCompleted(true);
    const success = await markMeetingAsCompleted(meeting.meeting_id);
    setIsMarkingCompleted(false);
    if (!success) {
      alert("Failed to mark meeting as completed");
    }
  };

  const handleAcceptMeeting = async () => {
    setIsAccepting(true);
    const success = await acceptMeeting(meeting.meeting_id);
    setIsAccepting(false);
    if (!success) {
      alert("Failed to accept meeting");
    }
  };

  const handleSaveReviewLink = async (link: string) => {
    setIsUpdating(true);
    const success = await setReviewLink(meeting.meeting_id, link);
    setIsUpdating(false);
    if (success) {
      setShowReviewLinkModal(false);
    } else {
      alert("Failed to save review link");
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case "pending":
        return "bg-yellow-600 text-yellow-100";
      case "accepted":
        return "bg-green-600 text-green-100";
      case "completed":
        return "bg-cyan-700 text-cyan-100";
      default:
        return "bg-gray-600 text-gray-100";
    }
  };

  const getBadgeText = () => {
    switch (type) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Confirmed";
      case "completed":
        return "Finished";
      default:
        return "";
    }
  };

  return (
    <>
      <div className='w-full rounded-lg bg-gray-800 p-4 outline-1 -outline-offset-1 outline-gray-700'>
        {/* Header */}
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <img
              src={meeting.mentee_avatar_url ?? "https://i.pravatar.cc/150"}
              alt={`${meeting.mentee_first_name} ${meeting.mentee_last_name}`}
              className='h-12 w-12 rounded-full object-cover'
            />
            <div>
              <h3 className='text-base font-medium text-white'>
                {meeting.mentee_first_name} {meeting.mentee_last_name}
              </h3>
              <p className='text-sm text-gray-400'>{meeting.plan_type}</p>
              <p className='text-sm text-cyan-500'>${meeting.plan_charge}/hour</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs ${getBadgeColor()}`}>{getBadgeText()}</span>
        </div>

        {/* Plan Description */}
        <div className='mb-2'>
          <p className='text-base font-medium text-cyan-500'>{meeting.plan_description}</p>
        </div>

        {/* DateTime Info */}
        <div className='mb-4 flex items-center gap-6 text-sm text-gray-400'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-3.5 w-3.5' />
            <span>{formatDate(meeting.date)}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Clock className='h-3.5 w-3.5' />
            <span>
              {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
            </span>
          </div>
          <span className='ml-auto font-medium text-cyan-500'>${meeting.amount_paid}</span>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3'>
          {type === "pending" && (
            <>
              {/* Accept Mentee Button */}
              <button
                onClick={() => {
                  void handleAcceptMeeting();
                }}
                disabled={isAccepting}
                className='flex flex-1 cursor-pointer items-center justify-center gap-2 rounded bg-green-600 py-2 text-white transition-colors hover:bg-green-500 disabled:opacity-50'
              >
                <UserCheck className='h-4 w-4' />
                {isAccepting ? "Accepting..." : "Accept Mentee"}
              </button>
            </>
          )}

          {type === "accepted" && (
            <>
              {/* Edit/Add Link Button */}
              <button
                onClick={handleEditLink}
                disabled={isUpdating}
                className='flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-500 disabled:opacity-50'
              >
                <LinkIcon className='h-4 w-4' />
                {meeting.location ? "Edit Link" : "Add Link"}
              </button>

              {/* Join Meeting Button */}
              <button
                onClick={handleJoinMeeting}
                disabled={!meeting.location}
                className='flex flex-1 cursor-pointer items-center justify-center gap-2 rounded bg-cyan-700 py-2 text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Video className='h-4 w-4' />
                Join Meeting
              </button>

              {/* Contact Mentee Button */}
              <button className='flex cursor-pointer items-center gap-2 rounded bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-500'>
                <MessageCircle className='h-4 w-4' />
                Contact Mentee
              </button>

              {/* Mark Completed Button */}
              <button
                onClick={() => {
                  void handleMarkCompleted();
                }}
                disabled={isMarkingCompleted}
                className='flex cursor-pointer items-center justify-center gap-2 rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-500 disabled:opacity-50'
              >
                <Check className='h-4 w-4' />
                {isMarkingCompleted ? "Marking..." : "Mark Completed"}
              </button>
            </>
          )}

          {type === "completed" && (
            <>
              <button
                onClick={() => {
                  setShowReviewLinkModal(true);
                }}
                className='flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-500'
              >
                <LinkIcon className='h-4 w-4' />
                {meeting.review_link ? "Edit Review Link" : "Add Review Link"}
              </button>
              {meeting.review_link && (
                <button
                  onClick={() => {
                    window.open(meeting.review_link ?? "", "_blank");
                  }}
                  className='flex flex-1 cursor-pointer items-center justify-center gap-2 rounded bg-blue-600 py-2 text-white transition-colors hover:bg-blue-500'
                >
                  <Video className='h-4 w-4' />
                  Open Review
                </button>
              )}

              {/* Contact Mentee Button */}
              <button className='flex cursor-pointer items-center gap-2 rounded bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-500'>
                <MessageCircle className='h-4 w-4' />
                Contact Mentee
              </button>
            </>
          )}
        </div>
      </div>

      {/* Meeting Link Input Modal */}
      <LinkInputModal
        isOpen={showLinkModal}
        title={meeting.location ? "Edit Meeting Link" : "Add Meeting Link"}
        description='Enter the Google Meet or Zoom link for this session'
        initialValue={meeting.location ?? ""}
        placeholder='https://meet.google.com/xxx-xxxx-xxx'
        submitText='Save'
        onSubmit={(link) => void handleSaveLink(link)}
        onCancel={() => {
          setShowLinkModal(false);
        }}
        isLoading={isUpdating}
      />

      {/* Review Link Input Modal */}
      <LinkInputModal
        isOpen={showReviewLinkModal}
        title={meeting.review_link ? "Edit Review Link" : "Add Review Link"}
        description='Enter a link for the mentee to review the session (e.g., recording, notes, resources)'
        initialValue={meeting.review_link ?? ""}
        placeholder='https://drive.google.com/...'
        submitText='Save'
        onSubmit={(link) => void handleSaveReviewLink(link)}
        onCancel={() => {
          setShowReviewLinkModal(false);
        }}
        isLoading={isUpdating}
      />
    </>
  );
}
