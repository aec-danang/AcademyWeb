import { Users, Activity, Plus, DollarSign, Target, BookOpen, Clock, ChevronRight, Mail, Phone, FileText, ShieldCheck, Star, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const [totalRevenue, newLeadsCount, totalEnrollments, activeStudents, recentOrders, recentLeads, publishedPostsCount, recentAccounts] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "completed" }
    }),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.courseEnrollment.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: true, course: true },
    }),
    prisma.lead.findMany({
      where: { status: "new" },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count({ where: { published: true } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const revenue = totalRevenue._sum.totalAmount || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Business Operations</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Monitor revenue, enrollments, and active leads requiring attention.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-orange hover:bg-orange-hover text-white shadow-lg shadow-orange/20 rounded-xl px-6 h-11 font-medium transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Quick Action
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden relative group transition-all hover:shadow-md hover:border-emerald-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</CardTitle>
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">${revenue.toLocaleString()}</div>
            <p className="text-sm text-slate-500 mt-3 font-medium opacity-80">Lifetime completed sales</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden relative group transition-all hover:shadow-md hover:border-orange/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Leads</CardTitle>
            <div className="p-3 bg-orange/10 dark:bg-orange/20 rounded-2xl text-orange dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
              <Target className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{newLeadsCount}</div>
            <p className="text-sm text-slate-500 mt-3 font-medium opacity-80">Requires follow-up</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden relative group transition-all hover:shadow-md hover:border-blue-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enrollments</CardTitle>
            <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{totalEnrollments}</div>
            <p className="text-sm text-slate-500 mt-3 font-medium opacity-80">Total course enrollments</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden relative group transition-all hover:shadow-md hover:border-purple-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Students</CardTitle>
            <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{activeStudents}</div>
            <p className="text-sm text-slate-500 mt-3 font-medium opacity-80">Registered student accounts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column (2/3) - Recent Orders & Recent Accounts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-5 pt-6 px-8 bg-slate-50/30 dark:bg-slate-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Recent Orders</CardTitle>
                  <CardDescription className="mt-1.5 text-slate-500 dark:text-slate-400 font-medium">The latest course purchases and enrollments.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="rounded-xl shadow-sm h-10 px-5 font-semibold bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
                  <Link href="/management">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
                  <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[200px] pl-8 py-4 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Student</TableHead>
                    <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Course</TableHead>
                    <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Amount</TableHead>
                    <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Date</TableHead>
                    <TableHead className="text-right pr-8 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order: any) => (
                    <TableRow key={order.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer">
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-200 pl-8 py-5">
                        <div className="flex flex-col">
                          <span>{order.user?.name || "Guest"}</span>
                          {order.user?.email && <span className="text-xs text-slate-500 font-normal">{order.user.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                        {order.course?.title || "Unknown Course"}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        ${order.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 text-sm font-medium py-5">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        }).format(new Date(order.createdAt))}
                      </TableCell>
                      <TableCell className="text-right pr-8 py-5">
                        <Badge variant="outline" className={`font-semibold rounded-full px-3 py-0.5 ${
                          order.status === "completed" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-orange/10 text-orange border-orange/20 dark:bg-orange/20 dark:text-orange-400"
                        }`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Activity className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                          <p>No recent orders found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-5 pt-6 px-8 bg-slate-50/30 dark:bg-slate-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Recent Accounts</CardTitle>
                  <CardDescription className="mt-1.5 text-slate-500 dark:text-slate-400 font-medium">The latest registered users and staff.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="rounded-xl shadow-sm h-10 px-5 font-semibold bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
                  <Link href="/management/accounts">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
                  <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[250px] pl-8 py-4 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">User</TableHead>
                    <TableHead className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Role</TableHead>
                    <TableHead className="text-right pr-8 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase py-4">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAccounts.map((account) => (
                    <TableRow key={account.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer">
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-200 pl-8 py-5">
                        <div className="flex flex-col">
                          <span>{account.name || account.username || "Unknown"}</span>
                          {account.email && <span className="text-xs text-slate-500 font-normal">{account.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge variant="outline" className={`font-semibold rounded-full px-3 py-0.5 ${
                          account.role === "ADMIN" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" :
                          account.role === "TEACHER" ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" :
                          "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20"
                        }`}>
                          {account.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8 py-5 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(account.createdAt))}
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentAccounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                          <p>No accounts found.</p>
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
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4 pt-5 px-6 bg-slate-50/30 dark:bg-slate-900/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Pending Leads
                  <Badge className="bg-orange hover:bg-orange text-white rounded-full px-2 py-0">
                    {newLeadsCount}
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{lead.name}</h4>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(lead.createdAt))}
                      </span>
                    </div>
                    {lead.message && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">"{lead.message}"</p>
                    )}
                    <div className="flex items-center gap-3">
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center transition-colors">
                          <Mail className="w-3.5 h-3.5 mr-1" /> Email
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center transition-colors">
                          <Phone className="w-3.5 h-3.5 mr-1" /> Call
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {recentLeads.length === 0 && (
                  <div className="p-8 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                      <ShieldCheck className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Inbox zero!</p>
                    <p className="text-xs text-slate-500 mt-1">No pending leads at the moment.</p>
                  </div>
                )}
              </div>
            </CardContent>
            {recentLeads.length > 0 && (
              <CardFooter className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-center">
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 text-xs font-semibold w-full" asChild>
                  <Link href="/management/leads">View All Leads <ChevronRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-6 bg-slate-50/30 dark:bg-slate-900/20 border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Published Posts</CardTitle>
              <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl text-indigo-500 dark:text-indigo-400">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{publishedPostsCount}</div>
              <p className="text-xs text-slate-500 mt-1 font-medium opacity-80">Active blog & news posts</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4 pt-5 px-6">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800" asChild>
                <Link href="/management/posts">
                  <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-semibold">Write Post</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800" asChild>
                <Link href="/management/features">
                  <Star className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-semibold">Features</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800" asChild>
                <Link href="/management/testimonials">
                  <MessageSquare className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-semibold">Testimonials</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800" asChild>
                <Link href="/management/sponsors">
                  <Activity className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-semibold">Sponsors</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
