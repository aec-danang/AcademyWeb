"use client";

import { useState } from "react";
import { X, Upload, CheckCircle2 } from "lucide-react";
import { submitScheduleAdjustment } from "@/lib/scheduleActions";
import { AdjustmentType } from "@prisma/client";

type ScheduleAdjustmentFormProps = {
  classroomId: string;
  className: string;
  eventDate: string;
  eventTime: string;
  initialType: "ABSENCE" | "MAKEUP";
  onClose: () => void;
};

export function ScheduleAdjustmentForm({ classroomId, className, eventDate, eventTime, initialType, onClose }: ScheduleAdjustmentFormProps) {
  const [type, setType] = useState<AdjustmentType>(initialType);
  const [targetDate, setTargetDate] = useState("");
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState(""); // Simplified for mockup
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "MAKEUP" && !targetDate) {
      alert("Please select a target date for the makeup class.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulating file upload URL if user provided anything
    const finalUrl = evidenceUrl || "https://example.com/mock-evidence.jpg";

    const res = await submitScheduleAdjustment(
      classroomId, 
      type, 
      eventDate, 
      reason, 
      finalUrl, 
      type === "MAKEUP" ? targetDate : undefined
    );
    
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => onClose(), 2000);
    } else {
      alert("Failed to submit request.");
    }
    
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-lg border border-slate-200">
        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Request Submitted!</h3>
        <p className="text-slate-500 mt-2">Your schedule adjustment request has been sent to the Admin.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-md w-full relative">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <X size={20} />
      </button>

      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h3 className="text-lg font-bold text-slate-900">Schedule Adjustment</h3>
        <p className="text-sm text-slate-500 mt-1">
          {className} • {new Date(eventDate).toLocaleDateString()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Request Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="type" 
                value="ABSENCE" 
                checked={type === "ABSENCE"}
                onChange={() => setType("ABSENCE")}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Report Absence (Báo nghỉ)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="type" 
                value="MAKEUP" 
                checked={type === "MAKEUP"}
                onChange={() => setType("MAKEUP")}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Schedule Makeup (Báo bù)</span>
            </label>
          </div>
        </div>

        {type === "MAKEUP" && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">New Makeup Date</label>
              <input 
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Time Slot (Locked)</label>
              <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-600 font-medium cursor-not-allowed">
                {eventTime}
              </div>
              <p className="text-xs text-blue-600/80 mt-1">Makeup class must match the original duration.</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason</label>
          <textarea 
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Please provide the reason for your request..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Evidence (Minh chứng)</label>
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter file URL (Mockup)"
            />
            <button type="button" className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 flex items-center gap-2 text-sm font-medium">
              <Upload size={16} />
              Upload
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Upload doctor's note or relevant documents.</p>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
