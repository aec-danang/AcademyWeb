import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#fef4eb] dark:bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center font-montserrat relative overflow-hidden transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white dark:bg-slate-800 rounded-full opacity-70 dark:opacity-20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-orange opacity-20 dark:opacity-10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        {/* Large 404 */}
        <h1 className="text-[10rem] md:text-[14rem] leading-none font-black text-orange dark:text-orange/90 select-none drop-shadow-sm mb-4">
          404
        </h1>
        
        <h2 className="text-3xl md:text-5xl font-extrabold text-navy dark:text-white tracking-tight mb-6">
          Looks like you're lost.
        </h2>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-lg mx-auto font-medium">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 bg-orange hover:bg-orange-hover text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange/20 hover:-translate-y-1 transition-all w-full sm:w-auto min-w-[200px]"
          >
            <Home className="w-5 h-5" />
            Homepage
          </Link>
          
          <Link 
            href="/programs" 
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:text-orange dark:hover:text-orange-400 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange/30 transition-all w-full sm:w-auto min-w-[200px]"
          >
            <Search className="w-5 h-5" />
            Our Programs
          </Link>
        </div>
      </div>
    </div>
  );
}
