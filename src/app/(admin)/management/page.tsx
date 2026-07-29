import { Users, Activity, DollarSign, Target, BookOpen, Clock, ChevronRight, Mail, Phone, FileText, ShieldCheck, Star, MessageSquare, Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const [newSubmissionsCount, totalEnrollments, activeStudents, recentSubmissions, publishedPostsCount, recentAccounts, draftPosts, recentPosts] = await Promise.all([
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
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.findMany({
      where: { published: false },
      take: 4,
      orderBy: { updatedAt: "desc" }
    }),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-7xl mx-auto">
      <div className="mb-8 px-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tổng quan Quản trị</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Theo dõi hoạt động, bài viết, lượt đăng ký học và yêu cầu tư vấn mới nhất.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden relative group transition-all duration-300 hover:shadow-[0_12px_40px_rgba(44,45,101,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-8">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Bài viết đã đăng</CardTitle>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-6 pt-4">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{publishedPostsCount}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Bài viết Blog & Tin tức công khai</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden relative group transition-all duration-300 hover:shadow-[0_12px_40px_rgba(246,141,46,0.15)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-8">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Yêu cầu liên hệ mới</CardTitle>
            <div className="p-3 bg-orange/10 dark:bg-orange/20 rounded-xl text-orange group-hover:bg-orange group-hover:text-white transition-colors duration-300">
              <Target className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-6 pt-4">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{newSubmissionsCount}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Cần xử lý & tư vấn ngay</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden relative group transition-all duration-300 hover:shadow-[0_12px_40px_rgba(44,45,101,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-8">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Đăng ký học viên</CardTitle>
            <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl text-blue-500 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-6 pt-4">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{totalEnrollments}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Lượt đăng ký học thành công</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden relative group transition-all duration-300 hover:shadow-[0_12px_40px_rgba(44,45,101,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-8">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Học viên hoạt động</CardTitle>
            <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl text-purple-500 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-6 pt-4">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{activeStudents}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Tài khoản học viên hệ thống</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-10 grid-cols-1 lg:grid-cols-3">
        {/* Left Column (2/3) - Workflow Items & Accounts */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Recent Drafts Section */}
          <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden">
            <CardHeader className="border-b border-gray-100/60 dark:border-slate-800 pb-6 pt-6 px-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange" />
                  <span>Bài viết bản nháp & Đang soạn thảo</span>
                </CardTitle>
                <CardDescription className="mt-1 text-slate-500 dark:text-slate-400 text-sm">Tiếp tục chỉnh sửa các bài viết chưa xuất bản.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="rounded-xl font-bold text-xs" asChild>
                <Link href="/management/posts/new">+ Tạo bản nháp</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {draftPosts.map((post: any) => (
                  <div key={post.slug} className="p-5 px-8 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between group">
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                      <Link href={`/management/posts/new?edit=${post.slug}`} className="font-bold text-slate-900 dark:text-slate-200 text-base hover:text-orange dark:hover:text-orange-400 truncate transition-colors">
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Cập nhật {new Intl.DateTimeFormat("vi-VN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(post.updatedAt))}</span>
                        <Badge variant="secondary" className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {post.type === 'post' ? 'Blog' : post.type === 'news' ? 'Tin tức' : 'Sự kiện'}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="shrink-0 text-xs font-bold text-orange hover:bg-orange/10 rounded-lg" asChild>
                      <Link href={`/management/posts/new?edit=${post.slug}`}>Tiếp tục viết →</Link>
                    </Button>
                  </div>
                ))}
                {draftPosts.length === 0 && (
                  <div className="p-8 text-center text-sm text-slate-400">
                    Không có bản nháp nào. Tạo bài viết mới để bắt đầu.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden">
            <CardHeader className="border-b border-gray-100/60 dark:border-slate-800 pb-6 pt-8 px-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Tài khoản mới đăng ký</CardTitle>
                  <CardDescription className="mt-2 text-slate-500 dark:text-slate-400 text-base font-medium">Danh sách thành viên và giảng viên vừa tạo tài khoản.</CardDescription>
                </div>
                <Link href="/management/accounts" className="text-orange dark:text-orange-400 font-bold hover:text-orange-hover dark:hover:text-orange-300 transition-colors flex items-center gap-1.5 text-sm bg-orange/10 dark:bg-orange/20 px-5 py-2.5 rounded-full border border-orange/20 dark:border-orange/30 hover:bg-orange/20 dark:hover:bg-orange/30">
                  Xem tất cả <ChevronRight size={16} strokeWidth={2.5} />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                  <TableRow className="border-b border-gray-100/60 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[250px] pl-8 py-5 text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Người dùng</TableHead>
                    <TableHead className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase py-5">Vai trò</TableHead>
                    <TableHead className="text-right pr-8 text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase py-5">Ngày tham gia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAccounts.map((account: any) => (
                    <TableRow key={account.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                      <TableCell className="font-bold text-slate-900 dark:text-slate-200 pl-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span>{account.name || account.username || "Chưa đặt tên"}</span>
                          {account.email && <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{account.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <Badge variant="outline" className={`font-bold rounded-full px-4 py-1.5 border-0 ${
                          account.role === "ADMIN" ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" :
                          account.role === "TEACHER" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" :
                          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          {account.role === "ADMIN" ? "Quản trị viên" : account.role === "TEACHER" ? "Giảng viên" : "Học viên"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8 py-6 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                        {new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(account.createdAt))}
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentAccounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-48 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                          <p className="font-medium text-lg">Chưa có tài khoản mới nào.</p>
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
                  Đăng ký tư vấn chờ xử lý
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
                        {new Intl.DateTimeFormat("vi-VN", { month: "numeric", day: "numeric" }).format(new Date(submission.createdAt))}
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
                          <Phone className="w-4 h-4 mr-2" /> Gọi điện
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
                    <p className="text-xl font-bold text-slate-900 dark:text-white">Đã xử lý xong!</p>
                    <p className="text-base text-slate-500 dark:text-slate-400 mt-2">Hiện chưa có đăng ký tư vấn mới nào cần xử lý.</p>
                  </div>
                )}
              </div>
            </CardContent>
            {recentSubmissions.length > 0 && (
              <CardFooter className="p-6 border-t border-gray-100/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-center">
                <Button variant="ghost" className="text-slate-700 dark:text-slate-300 hover:text-orange dark:hover:text-orange-400 hover:bg-transparent font-bold w-full text-base" asChild>
                  <Link href="/management/submissions">Xem tất cả đăng ký <ChevronRight className="w-5 h-5 ml-2" /></Link>
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card className="rounded-2xl border-0 bg-white dark:bg-[#0f172a] shadow-[0_8px_30px_rgba(44,45,101,0.06)] dark:shadow-none overflow-hidden">
            <CardHeader className="border-b border-gray-100/60 dark:border-slate-800 pb-6 pt-8 px-8">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-2 gap-5">
              <Link href="/management/posts/new" className="flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl p-6 transition-all duration-300 group shadow-sm border border-transparent hover:shadow-md hover:-translate-y-1">
                <FileText className="h-8 w-8 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold">Viết bài mới</span>
              </Link>
              <Link href="/management/settings" className="flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl p-6 transition-all duration-300 group shadow-sm border border-transparent hover:shadow-md hover:-translate-y-1">
                <Settings className="h-8 w-8 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold">Cài đặt trang</span>
              </Link>
              <Link href="/management/testimonials" className="flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl p-6 transition-all duration-300 group shadow-sm border border-transparent hover:shadow-md hover:-translate-y-1">
                <MessageSquare className="h-8 w-8 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold">Cảm nhận học viên</span>
              </Link>
              <Link href="/management/sponsors" className="flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl p-6 transition-all duration-300 group shadow-sm border border-transparent hover:shadow-md hover:-translate-y-1">
                <Activity className="h-8 w-8 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold">Nhà tài trợ</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
