"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { EventDetailsModal, CalendarEvent } from "./EventDetailsModal";

type ViewMode = "day" | "week";

const SUBJECT_COLORS: Record<string, string> = {
  class: "#3b82f6", // text-blue-500
  meeting: "#10b981", // text-emerald-500
  exam: "#f59e0b", // text-amber-500
};

export function CalendarBoard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date()); // For mini-calendar
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [now, setNow] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timelineRef.current) {
      const scrollTo = Math.max(0, (now.getHours() - 1) * 64);
      timelineRef.current.scrollTop = scrollTo;
    }
  }, [viewMode]); // Re-scroll when view mode changes

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
  const hours = Array.from({ length: 24 }, (_, i) => i); // Full 24 hours for better scrolling

  // Mock Events Generation (simulated for the current week)
  const generateMockEvents = () => {
    const events: CalendarEvent[] = [];
    // Just generate some events around the selectedDate
    const baseDate = new Date(selectedDate);
    baseDate.setDate(baseDate.getDate() - baseDate.getDay()); // Start of week
    
    // Tue Class
    let d = new Date(baseDate);
    d.setDate(d.getDate() + 2);
    events.push({
      id: "evt-1",
      title: "IELTS Foundation",
      time: "18:00 - 20:00",
      type: "class",
      classroomId: "cls-mock",
      dateStr: d.toISOString(),
    });

    // Thu Class
    d = new Date(baseDate);
    d.setDate(d.getDate() + 4);
    events.push({
      id: "evt-2",
      title: "TOEIC Master",
      time: "19:00 - 21:00",
      type: "class",
      classroomId: "cls-mock",
      dateStr: d.toISOString(),
    });

    // Fri Meeting
    d = new Date(baseDate);
    d.setDate(d.getDate() + 5);
    events.push({
      id: "evt-3",
      title: "Staff Meeting",
      time: "14:00 - 15:00",
      type: "meeting",
      classroomId: "cls-mock",
      dateStr: d.toISOString(),
    });

    return events;
  };

  const allEvents = generateMockEvents();
  
  // Helpers to format events
  const getEventStartHour = (timeStr: string) => parseInt(timeStr.split(" - ")[0].split(":")[0]);
  const getEventStartMin = (timeStr: string) => parseInt(timeStr.split(" - ")[0].split(":")[1]);
  const getEventEndHour = (timeStr: string) => parseInt(timeStr.split(" - ")[1].split(":")[0]);
  const getEventEndMin = (timeStr: string) => parseInt(timeStr.split(" - ")[1].split(":")[1]);
  
  // Dates for week view
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
    return allEvents.filter(e => e.dateStr.split("T")[0] === dStr);
  };

  const selectedEvents = viewMode === "day" ? getEventsForDate(selectedDate) : allEvents;

  // Mini calendar logic
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const formatDateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const todayKey = formatDateKey(today);
  const selectedKey = formatDateKey(selectedDate);

  const currentTimeTop = (now.getHours() * 60 + now.getMinutes()) * (64 / 60);

  return (
    <>
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex h-[800px]">
        {/* Left Sidebar: Mini Calendar & Legend */}
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
                      setCurrentDate(new Date(cellDate)); // sync month
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

          <div className="p-5 flex-1 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Event Types</h3>
            <div className="space-y-3">
              {Object.entries({ class: "Class", meeting: "Meeting", exam: "Exam" }).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: SUBJECT_COLORS[key] }} />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content: Timeline */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {viewMode === "day" 
                  ? selectedDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })
                  : `${weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                }
                {formatDateKey(selectedDate) === todayKey && viewMode === "day" && (
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2">Today</span>
                )}
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

          {/* Timeline Scroll Area */}
          <div className="flex-1 flex flex-col overflow-y-auto relative bg-white" ref={timelineRef}>
            {/* Week Headers (only in week mode) */}
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
              {/* Time Gutter */}
              <div className="w-16 shrink-0 border-r border-slate-100 bg-white">
                {hours.map(hour => (
                  <div key={hour} className="h-16 relative">
                    <span className="absolute -top-2.5 right-3 text-xs font-medium text-slate-400 font-mono">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Columns */}
              <div className={`flex-1 ${viewMode === "week" ? "grid grid-cols-7" : "flex"} relative bg-slate-50/30`}>
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col">
                  {hours.map(hour => (
                    <div key={hour} className="h-16 border-b border-slate-100 w-full" />
                  ))}
                </div>
                
                {/* Current Time Indicator */}
                {(viewMode === "day" && formatDateKey(selectedDate) === todayKey) || viewMode === "week" ? (
                  <div 
                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                    style={{ top: `${currentTimeTop}px` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm -ml-1.5 shrink-0" />
                    <div className="flex-1 h-0.5 bg-red-500 opacity-75" />
                  </div>
                ) : null}

                {/* Day Columns */}
                {viewMode === "week" ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-full border-r border-slate-100 last:border-0 relative">
                      {/* Events for this day */}
                      {allEvents.filter(e => e.dateStr.split("T")[0] === weekDates[i].toISOString().split("T")[0]).map(evt => {
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
                            onClick={() => setSelectedEvent(evt)}
                            className="absolute left-1 right-1 rounded-lg px-2 py-1.5 cursor-pointer hover:brightness-95 transition-all shadow-sm z-10 overflow-hidden"
                            style={{ 
                              top: `${top}px`, 
                              height: `${height}px`,
                              backgroundColor: `${color}1A`, // 10% opacity
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
                  <div className="flex-1 relative">
                    {/* Events for selected day */}
                    {selectedEvents.map(evt => {
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
                          onClick={() => setSelectedEvent(evt)}
                          className="absolute left-2 right-4 rounded-lg p-3 cursor-pointer hover:brightness-95 transition-all shadow-sm z-10 flex flex-col justify-between"
                          style={{ 
                            top: `${top}px`, 
                            height: `${height}px`,
                            backgroundColor: `${color}1A`, // 10% opacity
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

        {/* Right Sidebar: Upcoming */}
        <aside className="w-72 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Upcoming Events</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {allEvents.length > 0 ? (
              allEvents.map((event) => {
                const color = SUBJECT_COLORS[event.type] || SUBJECT_COLORS.class;
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="rounded-xl p-3 transition-colors hover:bg-slate-100 cursor-pointer bg-white border border-slate-200 shadow-sm"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <p className="text-sm font-bold text-slate-900">{event.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {new Date(event.dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <p className="text-xs font-medium text-slate-500 font-mono">
                        {event.time.split(" - ")[0]}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpen size={28} className="text-slate-300 mb-2" />
                <p className="text-xs text-slate-500">No upcoming events</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </>
  );
}
