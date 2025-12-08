import {
  Calendar,
  Clock,
  Star,
  Trash2,
  Video,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { MeetingResponse } from "@/types/meeting.type";
import { useNavigate } from "react-router-dom";
import { useMeetingStore } from "@/store/useMeetingStore";
import { useState, useEffect } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import ComplaintModal from "@/components/ComplaintModal";
import { checkMeetingExpiredPending, createComplaint, getComplaintByMeetingId } from "@/apis/complaint.api";
import showToast from "@/utils/toast";

interface MeetingCardProps {
  meeting: MeetingResponse;
  type: "accepted" | "outOfDate" | "completed" | "cancelled" | "pending";
}

export default function MeetingCard({ meeting, type }: MeetingCardProps) {
  const navigate = useNavigate();
  const { deleteMeeting, deleteMeetingPermanently } = useMeetingStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [canComplaint, setCanComplaint] = useState(false);
  const [complaintSent, setComplaintSent] = useState(false);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  // Check if mentee can file a complaint (after 1 minute of pending status)
  useEffect(() => {
    console.log("[MeetingCard] useEffect triggered, type:", type, "meeting_id:", meeting.meeting_id);
    if (type === "pending") {
      console.log("[MeetingCard] Type is pending, checking complaint eligibility...");
      const checkComplaintEligibility = async () => {
        let hasComplaintAlready = false;

        // First check if complaint already sent
        try {
          console.log("[Complaint] Calling getComplaintByMeetingId for meeting", meeting.meeting_id);
          const complaintResult = await getComplaintByMeetingId(meeting.meeting_id);
          console.log("[Complaint] Check existing complaint for meeting", meeting.meeting_id, ":", complaintResult);
          if (complaintResult.success && complaintResult.hasComplaint) {
            setComplaintSent(true);
            hasComplaintAlready = true;
          }
        } catch (error) {
          // If 401 or other error, continue to check expired pending
          console.error("Error checking existing complaint:", error);
        }

        // Then check if eligible to file complaint (skip if complaint already exists)
        if (!hasComplaintAlready) {
          try {
            console.log("[Complaint] Calling checkMeetingExpiredPending for meeting", meeting.meeting_id);
            const response = await checkMeetingExpiredPending(meeting.meeting_id);
            console.log("[Complaint] Check expired pending for meeting", meeting.meeting_id, ":", response);
            if (response.success) {
              console.log("[Complaint] Setting canComplaint to:", response.isExpired);
              setCanComplaint(response.isExpired);
            } else {
              console.log("[Complaint] Response not successful:", response);
            }
          } catch (error) {
            console.error("Error checking complaint eligibility:", error);
            // If the API call fails (e.g., 401), we can't show the complaint button
          }
        }
      };
      void checkComplaintEligibility();

      // Re-check every 15 seconds for faster feedback
      const interval = setInterval(() => {
        void checkComplaintEligibility();
      }, 15000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [type, meeting.meeting_id]);

  const handleComplaintSubmit = async (content: string) => {
    setIsSubmittingComplaint(true);
    try {
      const response = await createComplaint({
        meeting_id: meeting.meeting_id,
        content,
      });
      if (response.success) {
        showToast.success("Complaint submitted successfully. Our admin team will review it.");
        setComplaintSent(true);
        setShowComplaintModal(false);
      } else {
        showToast.error(response.message || "Failed to submit complaint");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      showToast.error("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

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

  const handleJoinMeeting = () => {
    if (meeting.location) {
      window.open(meeting.location, "_blank");
    } else {
      showToast.warning("Meeting link not available yet. Please wait for mentor to provide the link.");
    }
  };

  const handleReviewCourse = () => {
    if (meeting.review_link) {
      window.open(meeting.review_link, "_blank");
    } else {
      showToast.warning("Review link not available yet. Please wait for mentor to provide the link.");
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    let success: boolean;

    // If meeting is already cancelled, delete permanently
    if (type === "cancelled") {
      success = await deleteMeetingPermanently(meeting.meeting_id);
      if (!success) {
        showToast.error("Failed to delete meeting permanently");
      } else {
        showToast.success("Meeting deleted permanently");
      }
    } else {
      // Otherwise, just cancel the meeting
      success = await deleteMeeting(meeting.meeting_id);
      if (!success) {
        showToast.error("Failed to cancel meeting");
      } else {
        showToast.success("Meeting cancelled successfully");
      }
    }

    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleBookAnother = () => {
    if (meeting.mentor_id) {
      void navigate(`/mentor-profile/${String(meeting.mentor_id)}`);
    } else {
      void navigate("/mentor-browse");
    }
  };

  const handleReviewMeeting = () => {
    // Navigate to review page or open review modal
    showToast.info("Review feature coming soon!");
  };

  const getBadgeColor = () => {
    switch (type) {
      case "accepted":
        return "bg-green-600 text-green-100";
      case "outOfDate":
        return "bg-red-600 text-red-100";
      case "completed":
        return "bg-cyan-700 text-cyan-100";
      case "cancelled":
        return "bg-gray-600 text-gray-100";
      case "pending":
        return "bg-yellow-600 text-yellow-100";
      default:
        return "bg-gray-600 text-gray-100";
    }
  };

  const getBadgeText = () => {
    switch (type) {
      case "accepted":
        return "Confirmed";
      case "outOfDate":
        return "Out of Date";
      case "completed":
        return "Finished";
      case "cancelled":
        return "Cancelled";
      case "pending":
        return "Pending";
      default:
        return "";
    }
  };

  return (
    <div className='w-full rounded-lg bg-gray-800 p-4 outline-1 -outline-offset-1 outline-gray-700'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <img
            src={meeting.mentor_avatar_url ?? "https://i.pravatar.cc/150"}
            alt={`${meeting.mentor_first_name} ${meeting.mentor_last_name}`}
            className='h-12 w-12 rounded-full object-cover'
          />
          <div>
            <h3 className='text-base font-medium text-white'>
              {meeting.mentor_first_name} {meeting.mentor_last_name}
            </h3>
            <p className='text-sm text-gray-400'>{meeting.plan_type}</p>
            <p className='text-sm text-cyan-500'>${meeting.plan_charge}/hour</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs ${getBadgeColor()}`}>{getBadgeText()}</span>
      </div>

      {/* Plan Description */}
      <div className='mb-4'>
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
        {type === "accepted" && (
          <>
            <button
              onClick={handleJoinMeeting}
              className='flex cursor-pointer items-center justify-center gap-2 rounded bg-cyan-700 px-4 py-2 text-white transition-colors hover:bg-cyan-600'
            >
              <Video className='h-4 w-4' />
              Join Meeting
            </button>
            <button className='flex cursor-pointer items-center gap-2 rounded bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-500'>
              <MessageCircle className='h-4 w-4' />
              Contact mentor
            </button>
            <button
              onClick={handleBookAnother}
              className='cursor-pointer rounded bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600'
            >
              Book another slot
            </button>
          </>
        )}

        {type === "outOfDate" && (
          <>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className='flex cursor-pointer items-center gap-2 rounded bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50'
            >
              <Trash2 className='h-4 w-4' />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={handleBookAnother}
              className='flex-1 cursor-pointer rounded bg-purple-800 py-2 text-white transition-colors hover:bg-purple-700'
            >
              Book Another Mentorship
            </button>
          </>
        )}

        {type === "completed" && (
          <>
            {meeting.review_link && (
              <button
                onClick={handleReviewCourse}
                className='flex flex-1 cursor-pointer items-center justify-center gap-2 rounded bg-purple-600 py-2 text-white transition-colors hover:bg-purple-500'
              >
                <ExternalLink className='h-4 w-4' />
                Review Course
              </button>
            )}
            <button
              onClick={handleReviewMeeting}
              className='flex flex-1 cursor-pointer items-center justify-center gap-2 rounded bg-cyan-700 py-2 text-white transition-colors hover:bg-cyan-600'
            >
              <Star className='h-4 w-4' />
              Rate Mentor
            </button>
            <button
              onClick={handleBookAnother}
              className='cursor-pointer rounded bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700'
            >
              Book another slot
            </button>
          </>
        )}

        {type === "cancelled" && (
          <>
            <button
              onClick={handleBookAnother}
              className='flex-1 cursor-pointer rounded bg-purple-800 py-2 text-white transition-colors hover:bg-purple-700'
            >
              Book Another Mentorship
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className='cursor-pointer rounded bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </>
        )}

        {type === "pending" && (
          <>
            <button
              className='flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded bg-yellow-600 py-2 text-white opacity-75'
              disabled
            >
              <Clock className='h-4 w-4' />
              Waiting for Confirmation
            </button>
            <button className='flex cursor-pointer items-center gap-2 rounded bg-cyan-700 px-4 py-2 text-white transition-colors hover:bg-cyan-600'>
              <MessageCircle className='h-4 w-4' />
              Contact Mentor
            </button>
            {complaintSent ? (
              <button
                disabled
                className='flex cursor-not-allowed items-center gap-2 rounded bg-orange-600 px-4 py-2 text-white opacity-75'
              >
                <CheckCircle className='h-4 w-4' />
                Complaint Sent
              </button>
            ) : canComplaint ? (
              <button
                onClick={() => {
                  setShowComplaintModal(true);
                }}
                className='flex cursor-pointer items-center gap-2 rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700'
              >
                <AlertTriangle className='h-4 w-4' />
                Complaint
              </button>
            ) : null}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
        }}
        onConfirm={() => void confirmDelete()}
        title='Delete Meeting'
        message='Are you sure you want to delete this meeting? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        confirmButtonClass='bg-red-600 hover:bg-red-700'
        isLoading={isDeleting}
      />

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={showComplaintModal}
        mentorName={`${meeting.mentor_first_name} ${meeting.mentor_last_name}`}
        meetingId={meeting.meeting_id}
        onSubmit={handleComplaintSubmit}
        onCancel={() => {
          setShowComplaintModal(false);
        }}
        isLoading={isSubmittingComplaint}
      />
    </div>
  );
}
