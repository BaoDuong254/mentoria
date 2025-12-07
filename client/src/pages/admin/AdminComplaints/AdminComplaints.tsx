import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, XCircle, Clock, MessageSquare, Calendar } from "lucide-react";
import { getAllComplaints, updateComplaintStatus } from "@/apis/complaint.api";
import type { ComplaintResponse } from "@/types/complaint.type";

type ComplaintStatus = "Pending" | "Reviewed" | "Resolved" | "Rejected";

const statusColors: Record<ComplaintStatus, string> = {
  Pending: "bg-yellow-600 text-yellow-100",
  Reviewed: "bg-blue-600 text-blue-100",
  Resolved: "bg-green-600 text-green-100",
  Rejected: "bg-red-600 text-red-100",
};

const statusIcons: Record<ComplaintStatus, React.ElementType> = {
  Pending: Clock,
  Reviewed: MessageSquare,
  Resolved: CheckCircle,
  Rejected: XCircle,
};

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"Resolved" | "Rejected" | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const status = filterStatus === "all" ? undefined : filterStatus;
      const res = await getAllComplaints(1, 50, status);
      if (res.success) {
        setComplaints(res.data);
      } else {
        setError("Failed to load complaints");
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    void fetchComplaints();
  }, [fetchComplaints]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAction = (complaint: ComplaintResponse, action: "Resolved" | "Rejected") => {
    setSelectedComplaint(complaint);
    setActionType(action);
    setAdminResponse("");
    setShowActionDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedComplaint || !actionType) return;

    setIsProcessing(true);
    try {
      const res = await updateComplaintStatus(selectedComplaint.complaint_id, actionType, adminResponse);
      if (res.success) {
        // Refresh the list
        await fetchComplaints();
        setShowActionDialog(false);
        setSelectedComplaint(null);
        setActionType(null);
        setAdminResponse("");
      } else {
        alert("Failed to update complaint status");
      }
    } catch (err) {
      console.error("Error updating complaint:", err);
      alert("Failed to update complaint status");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className='flex h-64 items-center justify-center text-gray-400'>Loading complaints...</div>;
  }

  if (error) {
    return <div className='flex h-64 items-center justify-center text-red-500'>{error}</div>;
  }

  return (
    <div className='space-y-6'>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className='text-3xl font-bold text-white'>Complaints Management</h1>
        <p className='mt-1 text-gray-400'>Review and manage mentee complaints</p>
      </motion.div>

      {/* Filter */}
      <div className='flex items-center gap-4'>
        <span className='text-gray-400'>Filter by status:</span>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
          }}
          className='rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none'
        >
          <option value='all'>All</option>
          <option value='Pending'>Pending</option>
          <option value='Reviewed'>Reviewed</option>
          <option value='Resolved'>Resolved</option>
          <option value='Rejected'>Rejected</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        {(["Pending", "Reviewed", "Resolved", "Rejected"] as ComplaintStatus[]).map((status) => {
          const count = complaints.filter((c) => c.status === status).length;
          const Icon = statusIcons[status];
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='rounded-lg border border-gray-700 bg-gray-800 p-4'
            >
              <div className='flex items-center gap-3'>
                <div className={`rounded-full p-2 ${statusColors[status]}`}>
                  <Icon className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-white'>{count}</p>
                  <p className='text-sm text-gray-400'>{status}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Complaints List */}
      <div className='space-y-4'>
        {complaints.length === 0 ? (
          <div className='rounded-lg border border-gray-700 bg-gray-800 p-8 text-center'>
            <AlertCircle className='mx-auto h-12 w-12 text-gray-500' />
            <p className='mt-4 text-gray-400'>No complaints found</p>
          </div>
        ) : (
          complaints.map((complaint) => {
            const StatusIcon = statusIcons[complaint.status];
            return (
              <motion.div
                key={complaint.complaint_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='rounded-lg border border-gray-700 bg-gray-800 p-6'
              >
                {/* Header */}
                <div className='mb-4 flex items-start justify-between'>
                  <div className='flex items-center gap-4'>
                    <div
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${statusColors[complaint.status]}`}
                    >
                      <StatusIcon className='h-3 w-3' />
                      {complaint.status}
                    </div>
                    <span className='text-sm text-gray-400'>#{complaint.complaint_id}</span>
                  </div>
                  <span className='text-sm text-gray-500'>{formatDate(complaint.created_at)}</span>
                </div>

                {/* Users Info */}
                <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {/* Mentee */}
                  <div className='flex items-center gap-3 rounded-lg bg-gray-700/50 p-3'>
                    <img
                      src={complaint.mentee_avatar_url ?? "https://i.pravatar.cc/150"}
                      alt={complaint.mentee_first_name}
                      className='h-10 w-10 rounded-full object-cover'
                    />
                    <div>
                      <p className='text-sm text-gray-400'>Mentee (Complainant)</p>
                      <p className='font-medium text-white'>
                        {complaint.mentee_first_name} {complaint.mentee_last_name}
                      </p>
                      <p className='text-xs text-gray-500'>{complaint.mentee_email}</p>
                    </div>
                  </div>

                  {/* Mentor */}
                  <div className='flex items-center gap-3 rounded-lg bg-gray-700/50 p-3'>
                    <img
                      src={complaint.mentor_avatar_url ?? "https://i.pravatar.cc/150"}
                      alt={complaint.mentor_first_name}
                      className='h-10 w-10 rounded-full object-cover'
                    />
                    <div>
                      <p className='text-sm text-gray-400'>Mentor (Complained About)</p>
                      <p className='font-medium text-white'>
                        {complaint.mentor_first_name} {complaint.mentor_last_name}
                      </p>
                      <p className='text-xs text-gray-500'>{complaint.mentor_email}</p>
                    </div>
                  </div>
                </div>

                {/* Meeting Info */}
                <div className='mb-4 flex items-center gap-4 text-sm text-gray-400'>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-4 w-4' />
                    <span>Meeting #{complaint.meeting_id}</span>
                  </div>
                  <span>|</span>
                  <span>{formatDate(complaint.meeting_date)}</span>
                </div>

                {/* Complaint Content */}
                <div className='mb-4'>
                  <p className='mb-1 text-sm text-gray-400'>Complaint Details:</p>
                  <div className='rounded-lg bg-gray-700/50 p-4'>
                    <p className='text-white'>{complaint.content}</p>
                  </div>
                </div>

                {/* Admin Response (if any) */}
                {complaint.admin_response && (
                  <div className='mb-4'>
                    <p className='mb-1 text-sm text-gray-400'>Admin Response:</p>
                    <div className='rounded-lg border border-cyan-700/50 bg-cyan-900/30 p-4'>
                      <p className='text-cyan-100'>{complaint.admin_response}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {complaint.status === "Pending" && (
                  <div className='mt-4 flex gap-3'>
                    <button
                      onClick={() => {
                        handleAction(complaint, "Resolved");
                      }}
                      className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'
                    >
                      <CheckCircle className='h-4 w-4' />
                      Resolve & Refund
                    </button>
                    <button
                      onClick={() => {
                        handleAction(complaint, "Rejected");
                      }}
                      className='flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700'
                    >
                      <XCircle className='h-4 w-4' />
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Action Dialog */}
      {showActionDialog && selectedComplaint && actionType && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='absolute inset-0 bg-black/60'
            onClick={() => {
              setShowActionDialog(false);
            }}
          />
          <div className='relative z-10 w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl'>
            <h3 className='mb-4 text-xl font-semibold text-white'>
              {actionType === "Resolved" ? "Resolve Complaint" : "Reject Complaint"}
            </h3>
            <p className='mb-4 text-gray-400'>
              {actionType === "Resolved"
                ? "This will mark the complaint as resolved and may trigger a refund for the mentee."
                : "This will reject the complaint. Please provide a reason."}
            </p>
            <div className='mb-4'>
              <label className='mb-2 block text-sm font-medium text-gray-300'>Admin Response (optional)</label>
              <textarea
                value={adminResponse}
                onChange={(e) => {
                  setAdminResponse(e.target.value);
                }}
                placeholder='Enter your response...'
                rows={4}
                className='w-full resize-none rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none'
              />
            </div>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => {
                  setShowActionDialog(false);
                }}
                disabled={isProcessing}
                className='rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmAction()}
                disabled={isProcessing}
                className={`rounded-lg px-6 py-2 text-white disabled:opacity-50 ${
                  actionType === "Resolved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isProcessing ? "Processing..." : actionType === "Resolved" ? "Resolve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
