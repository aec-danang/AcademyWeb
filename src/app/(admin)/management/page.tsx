import { Users, Activity, DollarSign, Target, BookOpen, Clock, ChevronRight, Mail, Phone, FileText, ShieldCheck, Star, MessageSquare, Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const [newSubmissionsCount, totalEnrollments, activeStudents, recentSubmissions, publishedPostsCount, recentAccounts] = await Promise.all([
    prisma.contactSubmission.count({ where: { status: "NEW" } }),
    prisma.courseEnrollment.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.contactSubmission.findMany({
      where: { status: "NEW" },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count({ where: { published: true } }),
    prisma.user.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-7xl mx-auto">
      <div className="mb-8 px-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Monitor revenue, enrollments, and active leads requiring attention.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden relative group transition-all duration-300 hover:shadow-[0_12px_40px_rgba(44,45,101,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-8">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Published Posts</CardTitle>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-6 pt-4">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{publishedPostsCount}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Active blog & news posts</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden relative group transition-all duration-300 hover:shadow-[0_12px_40px_rgba(246,141,46,0.15)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-8">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">New Submissions</CardTitle>
            <div className="p-3 bg-orange/10 dark:bg-orange/20 rounded-xl text-orange group-hover:bg-orange group-hover:text-white transition-colors duration-300">
              <Target className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-6 pt-4">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{newSubmissionsCount}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Requires follow-up</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden relative group transition-all duration-300 hover:shadow-[0_12px_40px_rgba(44,45,101,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-8">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Enrollments</CardTitle>
            <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl text-blue-500 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-6 pt-4">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{totalEnrollments}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Total course enrollments</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden relative group transition-all duration-300 hover:shadow-[0_12px_40px_rgba(44,45,101,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-8">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Students</CardTitle>
            <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl text-purple-500 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-6 pt-4">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{activeStudents}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Registered student accounts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-10 grid-cols-1 lg:grid-cols-3">
        {/* Left Column (2/3) - Recent Accounts */}
        <div className="lg:col-span-2 space-y-10">
          
          <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden">
            <CardHeader className="border-b border-gray-100/60 dark:border-slate-800 pb-6 pt-8 px-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Recent Accounts</CardTitle>
                  <CardDescription className="mt-2 text-slate-500 dark:text-slate-400 text-base font-medium">The latest registered users and staff.</CardDescription>
                </div>
                <Link href="/management/accounts" className="text-orange dark:text-orange-400 font-bold hover:text-orange-hover dark:hover:text-orange-300 transition-colors flex items-center gap-1.5 text-sm bg-orange/10 dark:bg-orange/20 px-5 py-2.5 rounded-full border border-orange/20 dark:border-orange/30 hover:bg-orange/20 dark:hover:bg-orange/30">
                  View All <ChevronRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                  <TableRow className="border-b border-gray-100/60 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[250px] pl-8 py-5 text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">User</TableHead>
                    <TableHead className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase py-5">Role</TableHead>
                    <TableHead className="text-right pr-8 text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase py-5">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAccounts.map((account: any) => (
                    <TableRow key={account.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                      <TableCell className="font-bold text-slate-900 dark:text-slate-200 pl-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span>{account.name || account.username || "Unknown"}</span>
                          {account.email && <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{account.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <Badge variant="outline" className={`font-bold rounded-full px-4 py-1.5 border-0 ${
                          account.role === "ADMIN" ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" :
                          account.role === "TEACHER" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" :
                          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          {account.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8 py-6 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                        {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(account.createdAt))}
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentAccounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-48 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                          <p className="font-medium text-lg">No accounts found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3) - Pending Leads & Quick Actions */}
        <div className="lg:col-span-1 space-y-10">
          
          <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden">
            <CardHeader className="border-b border-gray-100/60 dark:border-slate-800 pb-6 pt-8 px-8">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  Pending Submissions
                  {newSubmissionsCount > 0 && (
                    <Badge className="bg-orange hover:bg-orange-hover text-white rounded-full px-3 py-1 font-bold border-0 shadow-sm">
                      {newSubmissionsCount}
                    </Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100/60 dark:divide-slate-800/50">
                {recentSubmissions.map((submission: any) => (
                  <div key={submission.id} className="p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{submission.name}</h4>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full flex items-center shadow-sm">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(submission.createdAt))}
                      </span>
                    </div>
                    {submission.message && (
                      <p className="text-base text-slate-600 dark:text-slate-400 mb-5 line-clamp-2 leading-relaxed">"{submission.message}"</p>
                    )}
                    <div className="flex items-center gap-5">
                      {submission.email && (
                        <a href={`mailto:${submission.email}`} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-orange dark:hover:text-orange-400 flex items-center transition-colors">
                          <Mail className="w-4 h-4 mr-2" /> Email
                        </a>
                      )}
                      {submission.phone && (
                        <a href={`tel:${submission.phone}`} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-orange dark:hover:text-orange-400 flex items-center transition-colors">
                          <Phone className="w-4 h-4 mr-2" /> Call
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {recentSubmissions.length === 0 && (
                  <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 shadow-sm">
                      <ShieldCheck className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">Inbox zero!</p>
                    <p className="text-base text-slate-500 dark:text-slate-400 mt-2">No pending submissions at the moment.</p>
                  </div>
                )}
              </div>
            </CardContent>
            {recentSubmissions.length > 0 && (
              <CardFooter className="p-6 border-t border-gray-100/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-center">
                <Button variant="ghost" className="text-slate-700 dark:text-slate-300 hover:text-orange dark:hover:text-orange-400 hover:bg-transparent font-bold w-full text-base" asChild>
                  <Link href="/management/submissions">View All Submissions <ChevronRight className="w-5 h-5 ml-2" /></Link>
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden">
            <CardHeader className="border-b border-gray-100/60 dark:border-slate-800 pb-6 pt-8 px-8">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-2 gap-5">
              <Link href="/management/posts" className="flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl p-6 transition-all duration-300 group shadow-sm border border-transparent hover:shadow-md hover:-translate-y-1">
                <FileText className="h-8 w-8 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold">Write Post</span>
              </Link>
              <Link href="/management/settings" className="flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl p-6 transition-all duration-300 group shadow-sm border border-transparent hover:shadow-md hover:-translate-y-1">
                <Settings className="h-8 w-8 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold">Settings</span>
              </Link>
              <Link href="/management/testimonials" className="flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl p-6 transition-all duration-300 group shadow-sm border border-transparent hover:shadow-md hover:-translate-y-1">
                <MessageSquare className="h-8 w-8 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold">Testimonials</span>
              </Link>
              <Link href="/management/sponsors" className="flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl p-6 transition-all duration-300 group shadow-sm border border-transparent hover:shadow-md hover:-translate-y-1">
                <Activity className="h-8 w-8 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold">Sponsors</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
