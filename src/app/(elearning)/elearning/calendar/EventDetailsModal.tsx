"use client";

import { X, Calendar as CalendarIcon, Clock, MapPin, User, FileText } from "lucide-react";
import { useState } from "react";
import { ScheduleAdjustmentForm } from "./ScheduleAdjustmentForm";

export type CalendarEvent = {
  id: string;
  title: string;
  time: string;
  type: string;
  classroomId: string;
  teacherName?: string;
  location?: string;
  dateStr: string;
};

type EventDetailsModalProps = {
  event: CalendarEvent;
  onClose: () => void;
};

export function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const [showAdjustmentForm, setShowAdjustmentForm] = useState<"ABSENCE" | "MAKEUP" | null>(null);

  if (showAdjustmentForm) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <ScheduleAdjustmentForm 
          classroomId={event.classroomId} 
          className={event.title} 
          eventDate={event.dateStr}
          eventTime={event.time}
          initialType={showAdjustmentForm}
          onClose={onClose} 
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="flex items-start justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${event.type === 'class' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{event.title}</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 capitalize">
                {event.type}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-slate-600 text-sm">
            <Clock size={16} className="text-slate-400" />
            <span>{new Date(event.dateStr).toLocaleDateString()} • {event.time}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <MapPin size={16} className="text-slate-400" />
              <span>{event.location}</span>
            </div>
          )}
          {event.teacherName && (
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <User size={16} className="text-slate-400" />
              <span>{event.teacherName}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setShowAdjustmentForm("ABSENCE")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileText size={16} className="text-orange-500" />
            Report Absence (Báo nghỉ)
          </button>
          <button 
            onClick={() => setShowAdjustmentForm("MAKEUP")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Clock size={16} />
            Makeup (Báo bù)
          </button>
        </div>
      </div>
    </div>
  );
}
