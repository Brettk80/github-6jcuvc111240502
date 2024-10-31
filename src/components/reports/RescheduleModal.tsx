import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import DateTimePicker from '../fax/DateTimePicker';

interface RescheduleModalProps {
  job: any;
  onClose: () => void;
  onReschedule: (date: Date) => void;
}

export default function RescheduleModal({ job, onClose, onReschedule }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = React.useState(job.scheduledTime);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-md w-full p-6"
      >
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">Reschedule Broadcast</h3>
          <p className="mt-1 text-sm text-gray-500">
            Job #{job.id} • Currently scheduled for {format(job.scheduledTime, 'MMM d, yyyy h:mm a')}
          </p>
        </div>

        <div className="mb-6">
          <DateTimePicker
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <motion.button
            onClick={() => onReschedule(selectedDate)}
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0)",
                "0 0 0 8px rgba(59, 130, 246, 0.2)",
                "0 0 0 0 rgba(59, 130, 246, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Update Schedule
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}