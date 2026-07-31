"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProgram, updateProgram, deleteProgram } from "./actions";
import { Plus, Edit2, Trash2, Search, Calendar, Target, Wallet, Users, Info, Layers, Code, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { IconSelector } from "@/components/ui/icon-selector";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Program = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  iconType: string;
  iconValue: string;
  order: number;
  published: boolean;
};

type OverviewItem = { label: string; value: string; icon: string };
type TimelineItem = { title: string; subtitle: string; duration: string; desc?: string };

type StructuredContent = {
  overview: OverviewItem[];
  timeline: TimelineItem[];
  note?: string;
};

const DEFAULT_OVERVIEW: OverviewItem[] = [
  { label: "LỊCH HỌC", value: "02 buổi/tuần (01 buổi GV Việt + 01 buổi GV Bản địa)", icon: "Calendar" },
  { label: "ĐỐI TƯỢNG & NỘI DUNG", value: "Phù hợp với học viên theo độ tuổi...", icon: "Target" },
  { label: "HỌC PHÍ", value: "6.000.000 VNĐ / 6 tháng", icon: "Wallet" },
  { label: "SĨ SỐ", value: "Nhóm 10 - 12 học viên", icon: "Users" },
];

const DEFAULT_TIMELINE: TimelineItem[] = [
  { title: "PRE", subtitle: "Cơ bản", duration: "Khóa A & B (03 tháng/ khóa)" },
  { title: "MID", subtitle: "Trung cấp", duration: "Khóa A & B (03 tháng/ khóa)" },
  { title: "ADV", subtitle: "Nâng cao", duration: "Khóa A & B (03 tháng/ khóa)" },
  { title: "HON", subtitle: "Chuyên sâu", duration: "Khóa A & B (03 tháng/ khóa)" },
];

function parseProgramContent(contentRaw: string | null): { isJson: boolean; structured: StructuredContent; html: string } {
  if (!contentRaw) {
    return {
      isJson: true,
      structured: { overview: DEFAULT_OVERVIEW, timeline: DEFAULT_TIMELINE, note: "" },
      html: "",
    };
  }

  try {
    const parsed = JSON.parse(contentRaw);
    if (parsed && typeof parsed === "object" && (parsed.overview || parsed.timeline)) {
      return {
        isJson: true,
        structured: {
          overview: Array.isArray(parsed.overview) ? parsed.overview : DEFAULT_OVERVIEW,
          timeline: Array.isArray(parsed.timeline) ? parsed.timeline : DEFAULT_TIMELINE,
          note: parsed.note || "",
        },
        html: "",
      };
    }
  } catch {}

  return {
    isJson: false,
    structured: { overview: DEFAULT_OVERVIEW, timeline: DEFAULT_TIMELINE, note: "" },
    html: contentRaw,
  };
}

export default function ProgramsClient({ initialPrograms }: { initialPrograms: Program[] }) {
  const router = useRouter();
  const [programs, setPrograms] = useState([...initialPrograms]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [editorTab, setEditorTab] = useState<"visual" | "html">("visual");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    iconType: "lucide",
    iconValue: "",
    published: true,
  });

  const [structuredContent, setStructuredContent] = useState<StructuredContent>({
    overview: DEFAULT_OVERVIEW,
    timeline: DEFAULT_TIMELINE,
    note: "",
  });

  const [htmlContent, setHtmlContent] = useState("");

  const filteredPrograms = programs.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (program: Program) => {
    setIsEditing(program.id);
    setIsCreating(false);
    setFormData({
      title: program.title,
      slug: program.slug,
      description: program.description || "",
      iconType: program.iconType,
      iconValue: program.iconValue,
      published: program.published,
    });

    const parsed = parseProgramContent(program.content);
    if (parsed.isJson) {
      setEditorTab("visual");
      setStructuredContent(parsed.structured);
      setHtmlContent("");
    } else {
      setEditorTab("html");
      setHtmlContent(parsed.html);
      setStructuredContent({ overview: DEFAULT_OVERVIEW, timeline: DEFAULT_TIMELINE, note: "" });
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
  };

  const buildFinalContentString = (): string => {
    if (editorTab === "visual") {
      return JSON.stringify(structuredContent);
    }
    return htmlContent;
  };

  const handleCreate = async () => {
    try {
      const newOrder = programs.length > 0 ? Math.max(...programs.map((p) => p.order)) + 1 : 1;
      const content = buildFinalContentString();
      await createProgram({ ...formData, content, order: newOrder });
      setIsCreating(false);
      toast.success("Đã thêm chương trình thành công.");
      router.refresh();
      setTimeout(() => window.location.reload(), 400);
    } catch {
      toast.error("Không thể tạo chương trình.");
    }
  };

  const handleUpdate = async () => {
    if (isEditing) {
      try {
        const programToEdit = programs.find((p) => p.id === isEditing);
        if (programToEdit) {
          const content = buildFinalContentString();
          await updateProgram(isEditing, { ...formData, content, order: programToEdit.order });
          setIsEditing(null);
          toast.success("Đã cập nhật chương trình.");
          router.refresh();
          setTimeout(() => window.location.reload(), 400);
        }
      } catch {
        toast.error("Cập nhật thất bại.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa chương trình đào tạo này không?")) {
      try {
        await deleteProgram(id);
        setPrograms((prev) => prev.filter((p) => p.id !== id));
        toast.success("Đã xóa chương trình.");
        router.refresh();
      } catch {
        toast.error("Không thể xóa chương trình.");
      }
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Chương trình đào tạo</h2>
        <p className="text-slate-500 dark:text-slate-400">Thêm, sửa trực quan hoặc ẩn các chương trình đào tạo trên website.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm chương trình theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 w-full h-10 shadow-sm"
            />
          </div>
        </div>
        <Button
          className="bg-orange hover:bg-orange-hover text-white h-10 shadow-sm w-full sm:w-auto transition-colors"
          onClick={() => {
            setIsCreating(true);
            setFormData({ title: "", slug: "", description: "", iconType: "lucide", iconValue: "", published: true });
            setStructuredContent({ overview: DEFAULT_OVERVIEW, timeline: DEFAULT_TIMELINE, note: "" });
            setHtmlContent("");
            setEditorTab("visual");
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm chương trình
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40 backdrop-blur-sm">
            <TableRow className="border-slate-200 dark:border-slate-800">
              <TableHead className="w-[200px] text-xs font-semibold tracking-wider text-slate-500 uppercase py-4">Tên chương trình</TableHead>
              <TableHead className="w-[120px] text-xs font-semibold tracking-wider text-slate-500 uppercase py-4">Slug (URL)</TableHead>
              <TableHead className="text-xs font-semibold tracking-wider text-slate-500 uppercase py-4">Mô tả ngắn (Độ tuổi)</TableHead>
              <TableHead className="w-[120px] text-xs font-semibold tracking-wider text-slate-500 uppercase py-4">Biểu tượng</TableHead>
              <TableHead className="w-[120px] text-right text-xs font-semibold tracking-wider text-slate-500 uppercase py-4 px-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                  <p>Không tìm thấy chương trình nào.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPrograms.map((item) => (
                <TableRow key={item.id} className="group border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</TableCell>
                  <TableCell className="text-slate-500">{item.slug}</TableCell>
                  <TableCell className="text-slate-500 truncate max-w-[200px]">{item.description}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{item.iconType === "lucide" ? item.iconValue : "Hình ảnh"}</TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => startEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Visual Program Editor Dialog */}
      <Dialog open={isCreating || isEditing !== null} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent className="sm:max-w-[850px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0b101e] max-h-[92vh] flex flex-col">
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
            <DialogTitle className="text-xl text-slate-900 dark:text-slate-100 font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange" />
              {isCreating ? "Thêm chương trình đào tạo" : `Chỉnh sửa: ${formData.title}`}
            </DialogTitle>
          </div>

          <div className="px-6 py-5 overflow-y-auto flex-1 space-y-6">
            {/* General Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Tên chương trình *</label>
                <Input
                  className="h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  placeholder="Ví dụ: Starter"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">URL Slug *</label>
                <Input
                  className="h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  placeholder="starter"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Độ tuổi / Phân loại</label>
                <Input
                  className="h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  placeholder="Độ tuổi: 07 - 10 Tuổi"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Icon Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Biểu tượng hiển thị</label>
              <IconSelector
                value={formData.iconValue}
                onValueChange={(value) => setFormData({ ...formData, iconValue: value })}
              />
            </div>

            {/* Editor Switcher */}
            <Tabs value={editorTab} onValueChange={(val) => setEditorTab(val as "visual" | "html")} className="w-full">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Chỉnh sửa nội dung khóa học
                </span>
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  <TabsTrigger value="visual" className="text-xs font-semibold rounded-lg flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    Trực quan (Form Cards)
                  </TabsTrigger>
                  <TabsTrigger value="html" className="text-xs font-semibold rounded-lg flex items-center gap-1.5">
                    <Code className="h-3.5 w-3.5" />
                    Soạn thảo Văn bản (Rich Text)
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Visual Structured Content Editor */}
              <TabsContent value="visual" className="space-y-6 mt-0">
                {/* 1. Overview Cards Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-orange flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" /> 1. 4 Thẻ Tổng quan (Overview Cards)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {structuredContent.overview.map((item, index) => (
                      <div key={index} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400">Thẻ #{index + 1}</span>
                          <span className="text-xs font-mono text-slate-500">{item.icon} Icon</span>
                        </div>
                        <Input
                          className="h-9 text-xs font-bold bg-white dark:bg-slate-900"
                          placeholder="Tiêu đề thẻ (ví dụ: LỊCH HỌC)"
                          value={item.label}
                          onChange={(e) => {
                            const next = [...structuredContent.overview];
                            next[index].label = e.target.value;
                            setStructuredContent({ ...structuredContent, overview: next });
                          }}
                        />
                        <Textarea
                          rows={2}
                          className="text-xs bg-white dark:bg-slate-900 resize-none"
                          placeholder="Nội dung chi tiết của thẻ..."
                          value={item.value}
                          onChange={(e) => {
                            const next = [...structuredContent.overview];
                            next[index].value = e.target.value;
                            setStructuredContent({ ...structuredContent, overview: next });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Timeline Step-by-Step */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Target className="h-4 w-4" /> 2. Các Lộ trình Cấp độ (Timeline Levels)
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 rounded-lg"
                      onClick={() => {
                        setStructuredContent({
                          ...structuredContent,
                          timeline: [...structuredContent.timeline, { title: "LVL", subtitle: "Cấp độ mới", duration: "03 tháng/ khóa" }],
                        });
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" /> Thêm Cấp độ
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {structuredContent.timeline.map((item, index) => (
                      <div key={index} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                        <div className="w-16 shrink-0">
                          <Input
                            className="h-9 text-xs font-bold text-center uppercase bg-white dark:bg-slate-900"
                            placeholder="Mã (PRE)"
                            value={item.title}
                            onChange={(e) => {
                              const next = [...structuredContent.timeline];
                              next[index].title = e.target.value;
                              setStructuredContent({ ...structuredContent, timeline: next });
                            }}
                          />
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            className="h-9 text-xs bg-white dark:bg-slate-900"
                            placeholder="Cấp độ (Cơ bản / Nâng cao)"
                            value={item.subtitle}
                            onChange={(e) => {
                              const next = [...structuredContent.timeline];
                              next[index].subtitle = e.target.value;
                              setStructuredContent({ ...structuredContent, timeline: next });
                            }}
                          />
                          <Input
                            className="h-9 text-xs bg-white dark:bg-slate-900"
                            placeholder="Thời gian (Khóa A & B - 3 tháng)"
                            value={item.duration}
                            onChange={(e) => {
                              const next = [...structuredContent.timeline];
                              next[index].duration = e.target.value;
                              setStructuredContent({ ...structuredContent, timeline: next });
                            }}
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-slate-400 hover:text-red-500 shrink-0"
                          onClick={() => {
                            const next = structuredContent.timeline.filter((_, i) => i !== index);
                            setStructuredContent({ ...structuredContent, timeline: next });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Important Note */}
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-amber-500" /> 3. Ghi chú Đánh giá / Kiểm tra
                  </label>
                  <Textarea
                    rows={2}
                    className="text-xs bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 rounded-xl resize-none"
                    placeholder="Ghi chú đánh giá học viên..."
                    value={structuredContent.note || ""}
                    onChange={(e) => setStructuredContent({ ...structuredContent, note: e.target.value })}
                  />
                </div>
              </TabsContent>

              {/* Rich Text Editor Fallback */}
              <TabsContent value="html" className="mt-0 space-y-2">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <RichTextEditor
                    content={htmlContent}
                    onChange={(content) => setHtmlContent(content)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3 shrink-0">
            <Button variant="ghost" className="rounded-xl h-10 px-4 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800" onClick={cancelEdit}>
              Hủy bỏ
            </Button>
            <Button className="rounded-xl h-10 px-6 bg-orange hover:bg-orange-hover text-white shadow-lg shadow-orange/20 font-semibold" onClick={isCreating ? handleCreate : handleUpdate}>
              {isCreating ? "Tạo chương trình" : "Lưu thay đổi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
