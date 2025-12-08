import { useEffect, useState, useMemo } from "react";
import { useMeetingStore } from "@/store/useMeetingStore";
import MeetingCard from "@/components/MeetingCard";
import EmptyState from "@/components/EmptyState";
import Calendar from "@/components/Calendar";
import ResolvedComplaintCard from "@/components/ResolvedComplaintCard";
import { getMyResolvedComplaints } from "@/apis/complaint.api";
import type { ComplaintResponse } from "@/types/complaint.type";

function MenteeDashboard() {
  const {
    selectedDate,
    isLoading,
    meetings,
    fetchMeetingsForMentee,
    setSelectedDate,
    getPendingMeetings,
    getAcceptedMeetings,
    getOutOfDateMeetings,
    getCompletedMeetings,
    getCancelledMeetings,
  } = useMeetingStore();

  const [resolvedComplaints, setResolvedComplaints] = useState<ComplaintResponse[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);

  useEffect(() => {
    void fetchMeetingsForMentee();
  }, [fetchMeetingsForMentee]);

  // Fetch resolved complaints
  useEffect(() => {
    const fetchResolvedComplaints = async () => {
      setIsLoadingComplaints(true);
      try {
        const response = await getMyResolvedComplaints();
        if (response.success) {
          setResolvedComplaints(response.data);
        }
      } catch (error) {
        console.error("Error fetching resolved complaints:", error);
      } finally {
        setIsLoadingComplaints(false);
      }
    };
    void fetchResolvedComplaints();
  }, []);

  const pendingMeetings = getPendingMeetings();
  const acceptedMeetings = getAcceptedMeetings();
  const outOfDateMeetings = getOutOfDateMeetings();
  const completedMeetings = getCompletedMeetings();
  const cancelledMeetings = getCancelledMeetings();

  // Filter resolved complaints by selected month
  const filteredResolvedComplaints = useMemo(() => {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    return resolvedComplaints.filter((complaint) => {
      const meetingDate = new Date(complaint.meeting_date);
      return meetingDate.getMonth() === selectedMonth && meetingDate.getFullYear() === selectedYear;
    });
  }, [resolvedComplaints, selectedDate]);

  const hasAnyMeetings =
    pendingMeetings.length > 0 ||
    acceptedMeetings.length > 0 ||
    outOfDateMeetings.length > 0 ||
    completedMeetings.length > 0 ||
    cancelledMeetings.length > 0 ||
    filteredResolvedComplaints.length > 0;

  // Get all meeting dates for calendar highlighting
  const meetingDates = meetings.map((m) => m.date.split("T")[0]);

  if (isLoading || isLoadingComplaints) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-900'>
        <div className='text-white'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full bg-gray-900 text-white'>
      <div className='mx-auto max-w-7xl px-6 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-2 text-2xl font-semibold'>MenteeDashboard</h1>
          <p className='text-gray-400'>Manage your mentoring sessions and requests</p>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Left: Meetings List */}
          <div className='space-y-8 lg:col-span-2'>
            {!hasAnyMeetings ? (
              <EmptyState />
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
                        <MeetingCard key={meeting.meeting_id} meeting={meeting} type='pending' />
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
                        <MeetingCard key={meeting.meeting_id} meeting={meeting} type='accepted' />
                      ))}
                    </div>
                  </div>
                )}

                {/* Out of Date Section */}
                {outOfDateMeetings.length > 0 && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-red-400'>Out of Date</h2>
                      <span className='flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm text-white'>
                        {outOfDateMeetings.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {outOfDateMeetings.map((meeting) => (
                        <MeetingCard key={meeting.meeting_id} meeting={meeting} type='outOfDate' />
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
                        <MeetingCard key={meeting.meeting_id} meeting={meeting} type='completed' />
                      ))}
                    </div>
                  </div>
                )}

                {/* Cancelled Section */}
                {cancelledMeetings.length > 0 && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-gray-400'>Cancelled</h2>
                      <span className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm text-white'>
                        {cancelledMeetings.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {cancelledMeetings.map((meeting) => (
                        <MeetingCard key={meeting.meeting_id} meeting={meeting} type='cancelled' />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolved Complaints Section - filtered by selected month */}
                {filteredResolvedComplaints.length > 0 && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-emerald-400'>Resolved Complaints</h2>
                      <span className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm text-white'>
                        {filteredResolvedComplaints.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {filteredResolvedComplaints.map((complaint) => (
                        <ResolvedComplaintCard key={complaint.complaint_id} complaint={complaint} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Calendar */}
          <div className='lg:col-span-1'>
            <div className='sticky top-6'>
              <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} meetingDates={meetingDates} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenteeDashboard;
