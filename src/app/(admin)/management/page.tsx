import { Users, UserRound, GraduationCap, ShieldCheck, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-navy dark:text-white">Overview</h2>
        <p className="text-muted-foreground mt-2">Manage your platform and view quick statistics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <div className="p-2 bg-orange/10 rounded-md">
              <Users className="h-4 w-4 text-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy dark:text-white">{totalAccounts}</div>
            <p className="text-xs text-muted-foreground mt-1">Editable roster</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-md">
              <GraduationCap className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy dark:text-white">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Role USER</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-md">
              <UserRound className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy dark:text-white">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground mt-1">Role TEACHER</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Accounts</CardTitle>
            <div className="p-2 bg-pink-500/10 rounded-md">
              <ShieldCheck className="h-4 w-4 text-pink-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy dark:text-white">{totalAdmins}</div>
            <p className="text-xs text-muted-foreground mt-1">Role ADMIN</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>The latest users to join the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="w-[200px]">Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4 text-slate-400" />
                      New User Registered
                    </TableCell>
                    <TableCell>{user.name || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {user.username && <span className="font-medium">@{user.username}</span>}
                        {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
                        {!user.username && !user.email && <span className="text-muted-foreground">N/A</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      }).format(new Date(user.createdAt))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                        Completed
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {recentUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No recent registrations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
