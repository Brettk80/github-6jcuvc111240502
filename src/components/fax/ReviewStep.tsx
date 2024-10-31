import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addMinutes } from 'date-fns';
import DateTimePicker from './DateTimePicker';

interface ReviewStepProps {
  hasTestFax?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onStartOver?: () => void;
}

// Time zones with offsets
const timeZones = [
  { name: "Honolulu", offset: -600 },
  { name: "Los Angeles", offset: -420 },
  { name: "Denver", offset: -360 },
  { name: "Chicago", offset: -300 },
  { name: "New York", offset: -240 },
  { name: "Berlin", offset: 120 },
  { name: "Beijing", offset: 480 },
  { name: "Shanghai", offset: 480 }
];

const ReviewStep: React.FC<ReviewStepProps> = ({
  hasTestFax = false,
  onNext,
  onBack,
  onStartOver
}) => {
  const [sendImmediately, setSendImmediately] = useState(true);
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());

  const handleDateChange = (date: Date) => {
    setScheduledDate(date);
  };

  const getTimeForZone = (offset: number) => {
    if (!scheduledDate) return "--:--";
    const zoneTime = addMinutes(scheduledDate, offset);
    return format(zoneTime, "h:mm a");
  };

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Schedule Delivery</h2>

      <div className="space-y-4">
        <div 
          className={`p-6 rounded-lg border cursor-pointer transition-colors ${
            sendImmediately 
              ? 'border-blue-200 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSendImmediately(true)}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              sendImmediately 
                ? 'border-blue-600' 
                : 'border-gray-300'
            }`}>
              {sendImmediately && (
                <div className="w-3 h-3 rounded-full bg-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium">Send immediately</h3>
              <p className="text-gray-600">
                {hasTestFax 
                  ? 'Broadcast will begin after test fax approval'
                  : 'Broadcast will begin processing right away'
                }
              </p>
            </div>
          </div>
        </div>

        <div 
          className={`p-6 rounded-lg border cursor-pointer transition-colors ${
            !sendImmediately 
              ? 'border-blue-200 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSendImmediately(false)}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              !sendImmediately 
                ? 'border-blue-600' 
                : 'border-gray-300'
            }`}>
              {!sendImmediately && (
                <div className="w-3 h-3 rounded-full bg-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium">Schedule for later</h3>
              <p className="text-gray-600">
                {hasTestFax 
                  ? 'Broadcast will begin at scheduled time after test fax approval'
                  : 'Broadcast will begin at your scheduled time'
                }
              </p>
            </div>
          </div>

          {!sendImmediately && (
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Your time zone: {userTimeZone}</p>
                <DateTimePicker
                  value={scheduledDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Broadcast Times</h4>
                <div className="grid grid-cols-2 gap-4">
                  {timeZones.map((zone) => (
                    <div key={zone.name} className="flex justify-between text-sm">
                      <span className="text-gray-600">{zone.name}</span>
                      <span className="text-gray-900">{getTimeForZone(zone.offset)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <button
            onClick={onStartOver}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Start Over
          </button>
        </div>

        <motion.button
          onClick={onNext}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0)",
              "0 0 0 8px rgba(59, 130, 246, 0.2)",
              "0 0 0 0 rgba(59, 130, 246, 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue
          <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default ReviewStep;