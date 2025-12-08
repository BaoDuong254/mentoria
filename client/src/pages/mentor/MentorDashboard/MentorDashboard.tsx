import { useEffect, useState, useMemo } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";
import { useSlotStore } from "@/store/useSlotStore";
import { useAuthStore } from "@/store/useAuthStore";
import MentorMeetingCard from "@/components/MentorMeetingCard";
import ComplaintedMeetingCard from "@/components/ComplaintedMeetingCard";
import Calendar from "@/components/Calendar";
import TimeInput from "@/components/TimeInput";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Plus, ChevronDown, Trash2 } from "lucide-react";
import type { Slot } from "@/types/booking.type";
import type { ComplaintResponse } from "@/types/complaint.type";
import { getComplaintsForMentor } from "@/apis/complaint.api";
import showToast from "@/utils/toast";

// Helper function to get duration from plan
const getPlanDuration = (plan: {
  plan_category?: string;
  sessions_duration?: number;
  minutes_per_call?: number;
}): number => {
  if (plan.plan_category === "session" && plan.sessions_duration) {
    return plan.sessions_duration;
  }
  if (plan.plan_category === "mentorship" && plan.minutes_per_call) {
    return plan.minutes_per_call;
  }
  // Default fallback
  return 60;
};

function MentorDashboard() {
  const { user } = useAuthStore();
  const {
    selectedDate,
    isLoading: isMeetingsLoading,
    meetings,
    fetchMeetingsForMentor,
    setSelectedDate,
    getAcceptedMeetings,
    getCompletedMeetings,
    getAllPendingMeetings,
  } = useMeetingStore();

  const {
    plans,
    selectedPlanId,
    isLoading: isSlotsLoading,
    fetchAllSlotsForMentor,
    setSelectedPlanId,
    addSlot,
    removeSlot,
    getSlotsForDate,
  } = useSlotStore();

  // State for available time slots form
  const [startTime, setStartTime] = useState("");
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [isDeletingSlot, setIsDeletingSlot] = useState<string | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);
  const [showDeleteSlotConfirm, setShowDeleteSlotConfirm] = useState(false);

  // State for complaints against this mentor
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    void fetchMeetingsForMentor();
  }, [fetchMeetingsForMentor]);

  useEffect(() => {
    if (user?.user_id) {
      void fetchAllSlotsForMentor(user.user_id);
    }
  }, [user?.user_id, fetchAllSlotsForMentor]);

  // Fetch complaints for this mentor
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoadingComplaints(true);
      try {
        const response = await getComplaintsForMentor();
        if (response.success) {
          setComplaints(response.data);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setIsLoadingComplaints(false);
      }
    };
    void fetchComplaints();
  }, []);

  const acceptedMeetings = getAcceptedMeetings();
  const completedMeetings = getCompletedMeetings();
  const pendingMeetings = getAllPendingMeetings();

  // Filter complaints by selected month
  const filteredComplaints = useMemo(() => {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    return complaints.filter((complaint) => {
      const meetingDate = new Date(complaint.meeting_date);
      return meetingDate.getMonth() === selectedMonth && meetingDate.getFullYear() === selectedYear;
    });
  }, [complaints, selectedDate]);

  const hasAnyMeetings =
    acceptedMeetings.length > 0 ||
    completedMeetings.length > 0 ||
    pendingMeetings.length > 0 ||
    filteredComplaints.length > 0;

  // Get all meeting dates for calendar highlighting
  const meetingDates = meetings.map((m) => m.date.split("T")[0]);

  // Get slots for the selected date
  const todaySlots = getSlotsForDate(selectedDate);

  // Get selected plan info
  const selectedPlan = plans.find((p) => p.plan_id === selectedPlanId);

  // Compute duration from selected plan (readonly)
  const duration = useMemo(() => {
    if (!selectedPlan) return 60;
    return getPlanDuration(selectedPlan);
  }, [selectedPlan]);

  // Format time for display
  const formatSlotTime = (timeString: string) => {
    const date = new Date(timeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${String(hour12)}:${String(minutes).padStart(2, "0")} ${ampm}`;
  };

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatLocalDate = (date: Date): string => {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to create ISO datetime string from local date and time
  const createLocalISOString = (date: Date, hours: number, minutes: number): string => {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const h = String(hours).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");
    return `${year}-${month}-${day}T${h}:${m}:00`;
  };

  // Handle adding a time slot
  const handleAddTimeSlot = async () => {
    if (!startTime) {
      showToast.warning("Please select a start time");
      return;
    }

    if (!selectedPlanId) {
      showToast.warning("Please select a plan type");
      return;
    }

    setIsAddingSlot(true);

    try {
      // Use local date format to avoid timezone issues
      const dateStr = formatLocalDate(selectedDate);
      const [hours, minutes] = startTime.split(":").map(Number);

      // Create start datetime in local timezone format (no Z suffix)
      const startDateTimeStr = createLocalISOString(selectedDate, hours, minutes);

      // Calculate end time based on duration (from plan)
      const durationMinutes = duration;
      const endHours = hours + Math.floor((minutes + durationMinutes) / 60);
      const endMinutes = (minutes + durationMinutes) % 60;
      const endDateTimeStr = createLocalISOString(selectedDate, endHours, endMinutes);

      const slotData = {
        startTime: startDateTimeStr,
        endTime: endDateTimeStr,
        date: dateStr,
        status: "Available" as const,
      };

      const result = await addSlot(selectedPlanId, slotData);
      if (result.success) {
        setStartTime("");
        // Refresh slots for mentor
        if (user?.user_id) {
          void fetchAllSlotsForMentor(user.user_id);
        }
        showToast.success("Time slot added successfully");
      } else {
        showToast.error(String(result.message) || "Failed to add time slot. Please try again.");
      }
    } catch (error) {
      console.error("Error adding slot:", error);
      showToast.error("Failed to add time slot. Please try again.");
    } finally {
      setIsAddingSlot(false);
    }
  };

  // Handle showing delete confirmation popup
  const handleDeleteSlotClick = (slot: Slot) => {
    if (slot.status === "Booked") {
      showToast.error("Cannot delete a booked slot");
      return;
    }
    setSlotToDelete(slot);
    setShowDeleteSlotConfirm(true);
  };

  // Handle confirming slot deletion
  const confirmDeleteSlot = async () => {
    if (!slotToDelete) return;

    setIsDeletingSlot(slotToDelete.slot_id);

    try {
      const success = await removeSlot(
        slotToDelete.plan_id,
        slotToDelete.start_time,
        slotToDelete.end_time,
        slotToDelete.date
      );
      if (success) {
        showToast.success("Time slot deleted successfully");
      } else {
        showToast.error("Failed to delete slot. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      showToast.error("Failed to delete slot. Please try again.");
    } finally {
      setIsDeletingSlot(null);
      setShowDeleteSlotConfirm(false);
      setSlotToDelete(null);
    }
  };

  // Legacy handler - redirect to popup
  const handleDeleteSlot = (slot: Slot) => {
    handleDeleteSlotClick(slot);
  };

  const isLoading = isMeetingsLoading || isSlotsLoading || isLoadingComplaints;

  if (isLoading && meetings.length === 0) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-900'>
        <div className='text-white'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full bg-gray-900 text-white'>
      <div className='mx-auto max-w-7xl px-6 py-8'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Left: Meetings List */}
          <div className='space-y-8 lg:col-span-2'>
            {/* Header */}
            <div>
              <h1 className='mb-2 text-2xl font-semibold'>Mentor Dashboard</h1>
              <p className='text-gray-400'>Manage your mentoring sessions and availability</p>
            </div>

            {!hasAnyMeetings ? (
              <div className='flex flex-col items-center justify-center rounded-lg bg-gray-800 py-20'>
                <p className='mb-4 text-gray-400'>No meetings scheduled yet</p>
                <p className='text-sm text-gray-500'>
                  Set your availability using the calendar on the right to start receiving bookings
                </p>
              </div>
            ) : (
              <>
                {/* Pending Section */}
                {pendingMeetings.length > 0 && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-yellow-500'>Pending</h2>
                      <span className='flex h-8 w-8 items-center justify-center rounded-full bg-yellow-600 text-sm text-white'>
                        {pendingMeetings.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {pendingMeetings.map((meeting) => (
                        <MentorMeetingCard key={meeting.meeting_id} meeting={meeting} type='pending' />
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Section */}
                {acceptedMeetings.length > 0 && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-cyan-500'>Accepted</h2>
                      <span className='flex h-8 w-8 items-center justify-center rounded-full bg-cyan-700 text-sm text-white'>
                        {acceptedMeetings.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {acceptedMeetings.map((meeting) => (
                        <MentorMeetingCard key={meeting.meeting_id} meeting={meeting} type='accepted' />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Section */}
                {completedMeetings.length > 0 && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-green-400'>Completed</h2>
                      <span className='flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm text-white'>
                        {completedMeetings.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {completedMeetings.map((meeting) => (
                        <MentorMeetingCard key={meeting.meeting_id} meeting={meeting} type='completed' />
                      ))}
                    </div>
                  </div>
                )}

                {/* Complaints Section - filtered by selected month */}
                {filteredComplaints.length > 0 && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-red-400'>Complaints Against You</h2>
                      <span className='flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm text-white'>
                        {filteredComplaints.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {filteredComplaints.map((complaint) => (
                        <ComplaintedMeetingCard key={complaint.complaint_id} complaint={complaint} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Availability Panel */}
          <div className='lg:col-span-1'>
            <div className='sticky top-6 space-y-6'>
              {/* Your Availability Header */}
              <div className='rounded-xl bg-gray-800 p-6 outline-1 outline-gray-700'>
                <h3 className='mb-2 text-lg font-semibold text-white'>Your Availability</h3>
                <p className='mb-4 text-sm text-gray-400'>Add time slots for mentees to book sessions</p>

                {/* Calendar */}
                <Calendar
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  meetingDates={meetingDates}
                  variant='mentor'
                />

                {/* Add Available Time Slot */}
                <div className='mt-6'>
                  <h4 className='mb-3 text-sm font-medium text-white'>Add Available Time Slot</h4>

                  <div className='mb-3 grid grid-cols-2 gap-3'>
                    {/* Start Time */}
                    <div className='relative z-40'>
                      <label className='mb-1 block text-xs text-gray-400'>Start Time</label>
                      <TimeInput
                        value={startTime}
                        onChange={(value) => {
                          setStartTime(value);
                        }}
                      />
                    </div>

                    {/* Duration (readonly, calculated from plan) */}
                    <div className='relative z-30'>
                      <label className='mb-1 block text-xs text-gray-400'>Duration</label>
                      <div className='flex w-full items-center justify-between rounded bg-gray-500 px-3 py-2 text-sm text-white opacity-50'>
                        {selectedPlan ? `${String(duration)} min` : "Select a plan"}
                      </div>
                    </div>
                  </div>

                  {/* Plan Type Dropdown */}
                  <div className='relative z-20 mb-4'>
                    <label className='mb-1 block text-xs text-gray-400'>Plan Type</label>
                    <button
                      onClick={() => {
                        setShowPlanDropdown(!showPlanDropdown);
                      }}
                      className='flex w-full cursor-pointer items-center justify-between rounded bg-gray-700 px-3 py-2 text-sm text-white'
                    >
                      {selectedPlan
                        ? `${selectedPlan.plan_type} - $${String(selectedPlan.plan_charge)}`
                        : "Select a plan"}
                      <ChevronDown className='h-4 w-4' />
                    </button>
                    {showPlanDropdown && (
                      <div className='absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded bg-gray-700 shadow-lg'>
                        {plans.length > 0 ? (
                          plans.map((plan) => (
                            <button
                              key={plan.plan_id}
                              onClick={() => {
                                setSelectedPlanId(plan.plan_id);
                                setShowPlanDropdown(false);
                              }}
                              className={`block w-full cursor-pointer px-3 py-2 text-left text-sm text-white hover:bg-gray-600 ${
                                selectedPlanId === plan.plan_id ? "bg-cyan-700" : ""
                              }`}
                            >
                              <div className='font-medium'>{plan.plan_type}</div>
                              <div className='text-xs text-gray-400'>
                                ${plan.plan_charge} - {plan.plan_description.substring(0, 40)}...
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className='px-3 py-2 text-sm text-gray-400'>No plans available</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add Time Slot Button */}
                  <button
                    onClick={() => void handleAddTimeSlot()}
                    disabled={isAddingSlot || !selectedPlanId}
                    className='flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-green-600 py-2 text-sm text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <Plus className='h-4 w-4' />
                    {isAddingSlot ? "Adding..." : "Add Time Slot"}
                  </button>
                </div>

                {/* Today's Schedule */}
                <div className='mt-6'>
                  <h4 className='mb-3 text-sm font-medium text-white'>
                    {selectedDate.toDateString() === new Date().toDateString()
                      ? "Today's Schedule"
                      : `Schedule for ${selectedDate.toLocaleDateString()}`}
                  </h4>
                  <div className='max-h-64 space-y-2 overflow-y-auto'>
                    {todaySlots.length === 0 ? (
                      <p className='text-sm text-gray-500'>No slots for this date</p>
                    ) : (
                      todaySlots.map((slot) => (
                        <div
                          key={slot.slot_id}
                          className={`rounded p-3 ${
                            slot.status === "Booked"
                              ? "border-l-4 border-cyan-500 bg-gray-700"
                              : "border-l-4 border-green-500 bg-gray-700"
                          }`}
                        >
                          <div className='flex items-center justify-between'>
                            <div>
                              <p className='text-sm font-medium text-white'>
                                {formatSlotTime(slot.start_time)} - {formatSlotTime(slot.end_time)}
                              </p>
                              <p className='text-xs text-gray-400'>
                                {slot.plan_type} - ${slot.plan_charge}
                              </p>
                              {slot.status === "Booked" ? (
                                <p className='text-xs text-cyan-400'>Booked</p>
                              ) : (
                                <p className='text-xs text-gray-400'>Open for booking</p>
                              )}
                            </div>
                            <div className='flex items-center gap-2'>
                              <span
                                className={`rounded px-2 py-0.5 text-xs ${
                                  slot.status === "Booked"
                                    ? "bg-gray-600 text-gray-300"
                                    : "bg-green-600/20 text-green-400"
                                }`}
                              >
                                {slot.status}
                              </span>
                              {slot.status === "Available" && (
                                <button
                                  onClick={() => {
                                    handleDeleteSlot(slot);
                                  }}
                                  disabled={isDeletingSlot === slot.slot_id}
                                  className='rounded p-1 text-red-400 hover:bg-red-900/20 disabled:opacity-50'
                                  title='Delete slot'
                                >
                                  <Trash2 className='h-4 w-4' />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Slot Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteSlotConfirm}
        onCancel={() => {
          setShowDeleteSlotConfirm(false);
          setSlotToDelete(null);
        }}
        onConfirm={() => void confirmDeleteSlot()}
        title='Delete Time Slot'
        message={`Are you sure you want to delete this time slot${slotToDelete ? ` (${slotToDelete.start_time.slice(0, 5)} - ${slotToDelete.end_time.slice(0, 5)})` : ""}? This action cannot be undone.`}
        confirmText='Delete'
        cancelText='Cancel'
        confirmButtonClass='bg-red-600 hover:bg-red-700'
        isLoading={isDeletingSlot !== null}
      />
    </div>
  );
}

export default MentorDashboard;
