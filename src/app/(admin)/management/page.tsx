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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your platform and view quick statistics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-orange hover:bg-orange-hover text-white shadow-md shadow-orange/20 rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden relative group transition-all hover:border-orange/50 dark:hover:border-orange/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Accounts</CardTitle>
            <div className="p-2.5 bg-orange/10 dark:bg-orange/20 rounded-xl">
              <Users className="h-4 w-4 text-orange dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalAccounts}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-medium flex items-center"><ArrowUpRight className="h-3 w-3" /> +12%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden relative group transition-all hover:border-blue-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Students</CardTitle>
            <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl">
              <GraduationCap className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1">Role USER</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden relative group transition-all hover:border-purple-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Teachers</CardTitle>
            <div className="p-2.5 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl">
              <UserRound className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalTeachers}</div>
            <p className="text-xs text-slate-500 mt-1">Role TEACHER</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden relative group transition-all hover:border-emerald-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Admin Accounts</CardTitle>
            <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl">
              <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalAdmins}</div>
            <p className="text-xs text-slate-500 mt-1">Role ADMIN</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Recent Registrations</CardTitle>
              <CardDescription className="mt-1 text-slate-500 dark:text-slate-400">The latest users to join the platform.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-xl shadow-sm text-xs h-8 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Link href="/management/accounts">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-slate-100 dark:border-b-slate-800/60 hover:bg-transparent">
                <TableHead className="w-[200px] pl-6 font-medium text-slate-500 dark:text-slate-400">Action</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400">User</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400">Contact</TableHead>
                <TableHead className="font-medium text-slate-500 dark:text-slate-400">Date</TableHead>
                <TableHead className="text-right pr-6 font-medium text-slate-500 dark:text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id} className="border-b-slate-50 dark:border-b-slate-800/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                  <TableCell className="font-medium flex items-center gap-3 pl-6 py-4">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-orange/10 group-hover:text-orange dark:group-hover:text-orange-400 transition-colors">
                      <Activity className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">New Registration</span>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-200">{user.name || "Unknown"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {user.username && <span className="font-medium text-sm text-slate-700 dark:text-slate-300">@{user.username}</span>}
                      {user.email && <span className="text-xs text-slate-500 dark:text-slate-400">{user.email}</span>}
                      {!user.username && !user.email && <span className="text-slate-400 text-xs italic">Not provided</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }).format(new Date(user.createdAt))}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-medium rounded-full px-3">
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
