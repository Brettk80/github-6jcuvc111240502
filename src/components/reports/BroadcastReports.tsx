import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Pause, 
  Play,
  Ban,
  Calendar,
  Eye,
  AlertTriangle,
  Flag
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import TestFaxApproval from './TestFaxApproval';
import RescheduleModal from './RescheduleModal';
import DocumentPreview from '../fax/DocumentPreview';

interface BroadcastJob {
  id: string;
  billingCode: string;
  scheduledTime: Date;
  status: 'pending_test' | 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  documents: {
    name: string;
    pageCount: number;
    previewUrl?: string;
  }[];
  recipients: {
    total: number;
    delivered: number;
    failed: number;
    pending: number;
  };
  testFax?: {
    status: 'pending' | 'delivered' | 'failed';
    deliveryTime?: Date;
    previewUrl?: string;
  };
}

export default function BroadcastReports() {
  const [selectedJob, setSelectedJob] = useState<BroadcastJob | null>(null);
  const [showTestFaxApproval, setShowTestFaxApproval] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showPreview, setShowPreview] = useState<{ file: File; name: string } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  // Mock data
  const jobs: BroadcastJob[] = [
    {
      id: '66461',
      billingCode: 'Q4-STATEMENTS',
      scheduledTime: new Date('2024-10-31T15:00:00'),
      status: 'pending_test',
      documents: [
        { name: 'Q4_Statement.pdf', pageCount: 3 }
      ],
      recipients: {
        total: 1250,
        delivered: 0,
        failed: 0,
        pending: 1250
      },
      testFax: {
        status: 'delivered',
        deliveryTime: new Date('2024-10-30T14:45:00')
      }
    },
    {
      id: '66460',
      billingCode: 'MONTHLY-NEWSLETTER',
      scheduledTime: new Date('2024-10-30T09:00:00'),
      status: 'in_progress',
      documents: [
        { name: 'Newsletter_Oct2024.pdf', pageCount: 2 }
      ],
      recipients: {
        total: 850,
        delivered: 425,
        failed: 25,
        pending: 400
      }
    }
  ];

  const handleTestFaxApproval = (jobId: string, approved: boolean) => {
    if (approved) {
      toast.success(
        <div>
          <div className="font-medium">Test Fax Approved</div>
          <div className="text-sm">Broadcast will begin at scheduled time</div>
        </div>
      );
    } else {
      toast.error(
        <div>
          <div className="font-medium">Test Fax Rejected</div>
          <div className="text-sm">Broadcast has been cancelled</div>
        </div>
      );
    }
    setShowTestFaxApproval(false);
  };

  const handleReschedule = (jobId: string, newDate: Date) => {
    toast.success(
      <div>
        <div className="font-medium">Broadcast Rescheduled</div>
        <div className="text-sm">
          New start time: {format(newDate, 'MMM d, yyyy h:mm a')}
        </div>
      </div>
    );
    setShowReschedule(false);
  };

  const handlePauseResume = (jobId: string, currentStatus: string) => {
    const action = currentStatus === 'paused' ? 'resumed' : 'paused';
    toast.success(
      <div>
        <div className="font-medium">Broadcast {action}</div>
        <div className="text-sm">Job ID: {jobId}</div>
      </div>
    );
  };

  const handleCancel = (jobId: string) => {
    toast.success(
      <div>
        <div className="font-medium">Broadcast Cancelled</div>
        <div className="text-sm">Job ID: {jobId}</div>
      </div>
    );
    setShowCancelConfirm(null);
  };

  const getStatusBadge = (status: BroadcastJob['status']) => {
    const badges = {
      pending_test: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
      in_progress: { color: 'bg-green-100 text-green-800', icon: Play },
      paused: { color: 'bg-orange-100 text-orange-800', icon: Pause },
      completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
      cancelled: { color: 'bg-red-100 text-red-800', icon: Ban }
    };

    const { color, icon: Icon } = badges[status];
    const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Fax Broadcasts</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor and manage your fax broadcast jobs
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        {jobs.map((job) => (
          <div key={job.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-lg font-medium">
                    Job #{job.id}
                    {job.billingCode && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({job.billingCode})
                      </span>
                    )}
                  </h3>
                  <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      Scheduled for {format(job.scheduledTime, 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
              {getStatusBadge(job.status)}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Documents Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Documents</h4>
                <div className="space-y-3">
                  {job.documents.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.pageCount} pages</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPreview({ 
                          file: new File([], doc.name),
                          name: doc.name
                        })}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recipients Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Recipients</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-medium text-gray-900">
                      {job.recipients.total.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivered</p>
                    <p className="text-lg font-medium text-green-600">
                      {job.recipients.delivered.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Failed</p>
                    <p className="text-lg font-medium text-red-600">
                      {job.recipients.failed.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-lg font-medium text-gray-900">
                      {job.recipients.pending.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Fax Section */}
            {job.testFax && (
              <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Flag className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-900">Test Fax Required</h4>
                    <p className="mt-1 text-sm text-yellow-700">
                      {job.testFax.status === 'delivered' ? (
                        <>
                          Test fax delivered at {format(job.testFax.deliveryTime!, 'h:mm a')}. 
                          Please review and approve to proceed with the broadcast.
                        </>
                      ) : job.testFax.status === 'pending' ? (
                        'Test fax is being processed...'
                      ) : (
                        'Test fax delivery failed. Please contact support.'
                      )}
                    </p>
                    {job.testFax.status === 'delivered' && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowTestFaxApproval(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                        >
                          Review Test Fax
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex items-center space-x-4">
              <button
                onClick={() => {
                  setSelectedJob(job);
                  setShowReschedule(true);
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reschedule
              </button>

              {job.status === 'in_progress' && (
                <button
                  onClick={() => handlePauseResume(job.id, job.status)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </button>
              )}

              {job.status === 'paused' && (
                <button
                  onClick={() => handlePauseResume(job.id, job.status)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </button>
              )}

              {['scheduled', 'in_progress', 'paused'].includes(job.status) && (
                <button
                  onClick={() => setShowCancelConfirm(job.id)}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {selectedJob && showTestFaxApproval && (
        <TestFaxApproval
          job={selectedJob}
          onClose={() => setShowTestFaxApproval(false)}
          onApprove={(approved) => handleTestFaxApproval(selectedJob.id, approved)}
        />
      )}

      {selectedJob && showReschedule && (
        <RescheduleModal
          job={selectedJob}
          onClose={() => setShowReschedule(false)}
          onReschedule={(date) => handleReschedule(selectedJob.id, date)}
        />
      )}

      {showPreview && (
        <DocumentPreview
          file={showPreview.file}
          onClose={() => setShowPreview(null)}
          onDownload={() => {/* Handle download */}}
        />
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cancel Broadcast?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. All pending faxes will be cancelled.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Keep Broadcasting
              </button>
              <button
                onClick={() => handleCancel(showCancelConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Yes, Cancel Broadcast
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}