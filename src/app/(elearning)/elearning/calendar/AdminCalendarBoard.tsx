"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Calendar as CalendarIcon, GripVertical, CheckCircle2 } from "lucide-react";
import { CalendarEvent } from "./EventDetailsModal";

type ViewMode = "day" | "week";

const SUBJECT_COLORS: Record<string, string> = {
  class: "#3b82f6", // text-blue-500
  meeting: "#10b981", // text-emerald-500
  exam: "#f59e0b", // text-amber-500
};

// Mock Unscheduled Classes
const MOCK_UNSCHEDULED = [
  { id: "uns-1", title: "IELTS Speaking Group 1", type: "class", durationHours: 2 },
  { id: "uns-2", title: "TOEFL Reading", type: "class", durationHours: 1.5 },
  { id: "uns-3", title: "Pending Makeup: Math", type: "class", durationHours: 2 },
];

export function AdminCalendarBoard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [now, setNow] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // State for events
  const [scheduledEvents, setScheduledEvents] = useState<CalendarEvent[]>([]);
  const [unscheduledEvents, setUnscheduledEvents] = useState(MOCK_UNSCHEDULED);

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    classId: string;
    className: string;
    duration: number;
    targetDate: Date;
    targetHour: number;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timelineRef.current) {
      const scrollTo = Math.max(0, (now.getHours() - 1) * 64);
      timelineRef.current.scrollTop = scrollTo;
    }
  }, [viewMode]); 

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevTime = () => {
    if (viewMode === "day") {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1));
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7));
    }
  };

  const nextTime = () => {
    if (viewMode === "day") {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1));
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 7));
    }
  };

  const today = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i); 

  // Helpers
  const getEventStartHour = (timeStr: string) => parseInt(timeStr.split(" - ")[0].split(":")[0]);
  const getEventStartMin = (timeStr: string) => parseInt(timeStr.split(" - ")[0].split(":")[1]);
  const getEventEndHour = (timeStr: string) => parseInt(timeStr.split(" - ")[1].split(":")[0]);
  const getEventEndMin = (timeStr: string) => parseInt(timeStr.split(" - ")[1].split(":")[1]);
  
  const currentDayOfWeek = selectedDate.getDay();
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - currentDayOfWeek);
  
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const getEventsForDate = (date: Date) => {
    const dStr = date.toISOString().split("T")[0];
    return scheduledEvents.filter(e => e.dateStr.split("T")[0] === dStr);
  };

  const selectedEventsForView = viewMode === "day" ? getEventsForDate(selectedDate) : scheduledEvents;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const formatDateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const todayKey = formatDateKey(today);
  const selectedKey = formatDateKey(selectedDate);

  const currentTimeTop = (now.getHours() * 60 + now.getMinutes()) * (64 / 60);

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, item: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    e.currentTarget.classList.add("bg-blue-50/50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-blue-50/50");
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-blue-50/50");
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (!data.id) return;

      // Calculate time from Y offset
      const bounds = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - bounds.top;
      // 64px = 1 hour
      const hour = Math.floor(y / 64);
      
      setConfirmModal({
        isOpen: true,
        classId: data.id,
        className: data.title,
        duration: data.durationHours,
        targetDate,
        targetHour: hour,
      });

    } catch (err) {
      console.error(err);
    }
  };

  const confirmSchedule = () => {
    if (!confirmModal) return;

    // Create the event
    const startH = confirmModal.targetHour;
    const endH = confirmModal.targetHour + Math.floor(confirmModal.duration);
    const endM = (confirmModal.duration % 1) * 60;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: confirmModal.className,
      time: `${String(startH).padStart(2, "0")}:00 - ${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
      type: "class",
      classroomId: confirmModal.classId,
      dateStr: confirmModal.targetDate.toISOString(),
    };

    setScheduledEvents(prev => [...prev, newEvent]);
    setUnscheduledEvents(prev => prev.filter(c => c.id !== confirmModal.classId));
    setConfirmModal(null);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex h-[800px]">
        {/* Left Sidebar */}
        <aside className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 hidden md:flex">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                <ChevronLeft size={16} className="text-slate-500" />
              </button>
              <span className="font-bold text-sm text-slate-900">
                {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 mb-2">
              {days.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-slate-500 py-1">
                  {d.substring(0, 1)}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const cellDate = new Date(year, month, day);
                const isSelected = formatDateKey(cellDate) === selectedKey;
                const isToday2 = formatDateKey(cellDate) === todayKey;
                const hasEvents = getEventsForDate(cellDate).length > 0;

                return (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDate(cellDate);
                      setCurrentDate(new Date(cellDate)); 
                    }}
                    className={`relative flex justify-center items-center h-8 w-8 mx-auto rounded-full text-xs font-medium transition-colors ${
                      isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : 
                      isToday2 ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {day}
                    {hasEvents && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content: Timeline */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {viewMode === "day" 
                  ? selectedDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })
                  : `${weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                }
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode("day")}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "day" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <CalendarIcon size={16} /> Day
                </button>
                <button 
                  onClick={() => setViewMode("week")}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "week" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <List size={16} /> Week
                </button>
              </div>

              <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <button onClick={prevTime} className="p-1.5 text-slate-500 hover:bg-slate-50 border-r border-slate-200">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-r border-slate-200">
                  Today
                </button>
                <button onClick={nextTime} className="p-1.5 text-slate-500 hover:bg-slate-50">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto relative bg-white" ref={timelineRef}>
            {viewMode === "week" && (
              <div className="flex border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-sm z-30">
                <div className="w-16 border-r border-slate-100 shrink-0"></div>
                <div className="flex-1 grid grid-cols-7">
                  {weekDates.map((date, i) => {
                    const isToday = formatDateKey(date) === todayKey;
                    return (
                      <div key={i} className="py-3 flex flex-col items-center border-r border-slate-100 last:border-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{days[i]}</span>
                        <span className={`text-base mt-0.5 w-7 h-7 flex items-center justify-center rounded-full font-medium ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                          {date.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-1 relative" style={{ minHeight: `${24 * 64}px` }}>
              <div className="w-16 shrink-0 border-r border-slate-100 bg-white">
                {hours.map(hour => (
                  <div key={hour} className="h-16 relative">
                    <span className="absolute -top-2.5 right-3 text-xs font-medium text-slate-400 font-mono">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>
              
              <div className={`flex-1 ${viewMode === "week" ? "grid grid-cols-7" : "flex"} relative bg-slate-50/30`}>
                <div className="absolute inset-0 pointer-events-none flex flex-col">
                  {hours.map(hour => (
                    <div key={hour} className="h-16 border-b border-slate-100 w-full" />
                  ))}
                </div>
                
                {/* Day Columns - Droppable Zones */}
                {viewMode === "week" ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-full border-r border-slate-100 last:border-0 relative transition-colors"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, weekDates[i])}
                    >
                      {scheduledEvents.filter(e => e.dateStr.split("T")[0] === weekDates[i].toISOString().split("T")[0]).map(evt => {
                        const startH = getEventStartHour(evt.time);
                        const startM = getEventStartMin(evt.time);
                        const endH = getEventEndHour(evt.time);
                        const endM = getEventEndMin(evt.time);
                        
                        const top = (startH * 60 + startM) * (64 / 60);
                        const duration = (endH * 60 + endM) - (startH * 60 + startM);
                        const height = Math.max(duration * (64 / 60), 28);
                        const color = SUBJECT_COLORS[evt.type] || SUBJECT_COLORS.class;

                        return (
                          <div 
                            key={evt.id}
                            className="absolute left-1 right-1 rounded-lg px-2 py-1.5 shadow-sm z-10 overflow-hidden"
                            style={{ 
                              top: `${top}px`, 
                              height: `${height}px`,
                              backgroundColor: `${color}1A`, 
                              borderLeft: `3px solid ${color}`,
                            }}
                          >
                            <div className="font-bold text-xs leading-tight text-slate-800">{evt.title}</div>
                            <div className="text-[10px] font-medium text-slate-600 mt-0.5">{evt.time}</div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div 
                    className="flex-1 relative transition-colors"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, selectedDate)}
                  >
                    {selectedEventsForView.map(evt => {
                      const startH = getEventStartHour(evt.time);
                      const startM = getEventStartMin(evt.time);
                      const endH = getEventEndHour(evt.time);
                      const endM = getEventEndMin(evt.time);
                      
                      const top = (startH * 60 + startM) * (64 / 60);
                      const duration = (endH * 60 + endM) - (startH * 60 + startM);
                      const height = Math.max(duration * (64 / 60), 28);
                      const color = SUBJECT_COLORS[evt.type] || SUBJECT_COLORS.class;

                      return (
                        <div 
                          key={evt.id}
                          className="absolute left-2 right-4 rounded-lg p-3 shadow-sm z-10 flex flex-col justify-between"
                          style={{ 
                            top: `${top}px`, 
                            height: `${height}px`,
                            backgroundColor: `${color}1A`, 
                            borderLeft: `4px solid ${color}`,
                          }}
                        >
                          <div>
                            <div className="font-bold text-sm text-slate-900">{evt.title}</div>
                            <div className="text-xs font-medium text-slate-600 mt-1">{evt.time}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Draggable Unscheduled Items */}
        <aside className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="text-sm font-bold text-slate-900">Unscheduled & Makeups</h3>
            <p className="text-xs text-slate-500 mt-1">Drag and drop to schedule</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {unscheduledEvents.length > 0 ? (
              unscheduledEvents.map((item) => {
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    className="rounded-xl p-3 bg-white border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors group flex items-start gap-3"
                  >
                    <GripVertical size={16} className="text-slate-400 mt-0.5 group-hover:text-blue-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {item.durationHours} Hours
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 size={28} className="text-emerald-400 mb-2" />
                <p className="text-sm font-bold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No pending classes to schedule.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Schedule Class</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to schedule <strong>{confirmModal.className}</strong> on{" "}
              <strong>{confirmModal.targetDate.toLocaleDateString()}</strong> at{" "}
              <strong>{String(confirmModal.targetHour).padStart(2, "0")}:00</strong>?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSchedule}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
