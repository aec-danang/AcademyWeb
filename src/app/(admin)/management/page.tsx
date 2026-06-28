import { Users, UserRound, GraduationCap, ShieldCheck, Activity, ArrowUpRight, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const [totalAccounts, totalStudents, totalTeachers, totalAdmins, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your platform and view quick statistics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-orange hover:bg-orange-hover text-white shadow-lg shadow-orange/20 rounded-xl px-6 h-11 font-medium transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white dark:bg-slate-900/50 overflow-hidden relative group transition-all hover:shadow-[0_8px_30px_rgb(246,141,46,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Accounts</CardTitle>
            <div className="p-3 bg-orange/10 dark:bg-orange/20 rounded-2xl text-orange dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{totalAccounts}</div>
            <p className="text-sm text-slate-500 mt-3 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-500 flex items-center bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md"><ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> +12%</span> 
              <span className="opacity-80">from last month</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white dark:bg-slate-900/50 overflow-hidden relative group transition-all hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Students</CardTitle>
            <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{totalStudents}</div>
            <p className="text-sm text-slate-500 mt-3 font-medium opacity-80">Role USER</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white dark:bg-slate-900/50 overflow-hidden relative group transition-all hover:shadow-[0_8px_30px_rgb(168,85,247,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Teachers</CardTitle>
            <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
              <UserRound className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{totalTeachers}</div>
            <p className="text-sm text-slate-500 mt-3 font-medium opacity-80">Role TEACHER</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white dark:bg-slate-900/50 overflow-hidden relative group transition-all hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 px-6">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Admin</CardTitle>
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{totalAdmins}</div>
            <p className="text-sm text-slate-500 mt-3 font-medium opacity-80">Role ADMIN</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] bg-white dark:bg-slate-900/50 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-5 pt-6 px-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Recent Registrations</CardTitle>
              <CardDescription className="mt-1.5 text-slate-500 dark:text-slate-400 font-medium">The latest users to join the platform.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-xl shadow-sm h-10 px-5 font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Link href="/management/accounts">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-slate-100 dark:border-b-slate-800/60 hover:bg-transparent">
                <TableHead className="w-[250px] pl-8 py-4 font-semibold text-slate-500 dark:text-slate-400">Action</TableHead>
                <TableHead className="font-semibold text-slate-500 dark:text-slate-400 py-4">User</TableHead>
                <TableHead className="font-semibold text-slate-500 dark:text-slate-400 py-4">Contact</TableHead>
                <TableHead className="font-semibold text-slate-500 dark:text-slate-400 py-4">Date</TableHead>
                <TableHead className="text-right pr-8 font-semibold text-slate-500 dark:text-slate-400 py-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id} className="border-b-slate-50 dark:border-b-slate-800/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                  <TableCell className="font-medium flex items-center gap-4 pl-8 py-5">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-orange/10 group-hover:text-orange dark:group-hover:text-orange-400 transition-colors shadow-sm">
                      <Activity className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-orange dark:group-hover:text-orange-400 transition-colors">New Registration</span>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-200">{user.name || "Unknown"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {user.username && <span className="font-medium text-sm text-slate-700 dark:text-slate-300">@{user.username}</span>}
                      {user.email && <span className="text-xs text-slate-500 dark:text-slate-400">{user.email}</span>}
                      {!user.username && !user.email && <span className="text-slate-400 text-xs italic">Not provided</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400 text-sm font-medium py-5">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }).format(new Date(user.createdAt))}
                  </TableCell>
                  <TableCell className="text-right pr-8 py-5">
                    <Badge variant="outline" className="bg-emerald-50/80 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-semibold rounded-full px-4 py-1">
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {recentUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p>No recent registrations found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
