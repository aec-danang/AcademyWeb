import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Opening Schedule | Academy',
  description: 'Learn more about Opening Schedule at Academy English Center.',
};

const schedules = [
  { program: "Kids & Teens", days: "Tue, Thu", time: "17:30 - 19:00", startDate: "Every month" },
  { program: "Kids & Teens", days: "Sat, Sun", time: "08:30 - 10:00", startDate: "Every month" },
  { program: "IELTS Foundation", days: "Mon, Wed, Fri", time: "18:00 - 19:30", startDate: "15th of the month" },
  { program: "IELTS Intensive", days: "Tue, Thu, Sat", time: "19:30 - 21:00", startDate: "5th of the month" },
  { program: "Communication", days: "Mon, Wed, Fri", time: "19:30 - 21:00", startDate: "Every month" },
];

export default function SchedulePage() {
  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-navy dark:text-white">Opening Schedule</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">Find the right time for your classes at Academy English Center.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Program</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Days</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Time</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Start Date</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-navy dark:text-slate-200">{schedule.program}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{schedule.days}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{schedule.time}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{schedule.startDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-orange/10 dark:bg-orange/5 p-8 rounded-2xl text-center border border-orange/20">
        <h2 className="text-2xl font-bold text-navy dark:text-white mb-4">Ready to start learning?</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
          Contact our admission team to find the best schedule for you and book a placement test.
        </p>
        <Link href="/contact" className="btn-primary inline-flex items-center justify-center">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
