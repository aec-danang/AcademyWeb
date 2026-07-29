"use client";

import { useState } from "react";
import { saveSettings, updateAdminAccount } from "./actions";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

type Setting = {
  key: string;
  value: string;
};

type UserInfo = {
  id: string;
  name: string | null;
  email: string | null;
} | null;

const DEFAULT_KEYS = [
  { key: "contact_email", label: "Email liên hệ", placeholder: "contact@aec.edu.vn" },
  { key: "contact_phone", label: "Số điện thoại Hotline", placeholder: "090 123 4567" },
  { key: "facebook_url", label: "Địa chỉ Facebook Fanpage", placeholder: "https://facebook.com/..." },
  { key: "address", label: "Địa chỉ trụ sở chính", placeholder: "Số 123 Đường Nguyễn Văn Cừ..." },
  { key: "footer_text", label: "Văn bản bản quyền Footer", placeholder: "© 2026 Anh ngữ AEC. Tất cả quyền được bảo lưu." },
];

const STATS_KEYS = [
  { key: "stats_native_teachers", label: "Giáo viên bản xứ", placeholder: "Ví dụ: 44" },
  { key: "stats_happy_students", label: "Học viên hài lòng", placeholder: "Ví dụ: 15,000+" },
  { key: "stats_years_experience", label: "Năm kinh nghiệm", placeholder: "Ví dụ: 15" },
];

const FEATURES_KEYS = [
  { prefix: "feature_1", titleKey: "feature_1_title", descKey: "feature_1_desc", defaultTitle: "Đào tạo chất lượng cao", defaultDesc: "Cung cấp chương trình Tiếng Anh đa dạng, đạt chuẩn quốc tế giúp học viên phát triển toàn diện." },
  { prefix: "feature_2", titleKey: "feature_2_title", descKey: "feature_2_desc", defaultTitle: "Kỹ năng mềm toàn diện", defaultDesc: "Rèn luyện kỹ năng sống và giá trị bản thân giúp người học tự tin trở thành công dân toàn cầu." },
  { prefix: "feature_3", titleKey: "feature_3_title", descKey: "feature_3_desc", defaultTitle: "Giáo dục nhân văn", defaultDesc: "Duy trì sự chuyên nghiệp, chuẩn mực và đặt sự phát triển tính cách của học viên lên hàng đầu." },
  { prefix: "feature_4", titleKey: "feature_4_title", descKey: "feature_4_desc", defaultTitle: "Tầm nhìn & Sứ mệnh", defaultDesc: "Xây dựng AEC thành cộng đồng học tập tận tâm, phục vụ chuyên nghiệp và hết lòng vì sự thành công của học viên." },
];

export default function SettingsClient({ initialSettings, user }: { initialSettings: Setting[], user?: UserInfo }) {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>(
    initialSettings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
  );

  const [accountData, setAccountData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: ""
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleStandardChange = (key: string, value: string) => {
    setSettingsMap(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Save account settings if user exists
    if (user?.id) {
      const updates: any = {};
      if (accountData.name !== user.name) updates.name = accountData.name;
      if (accountData.email !== user.email) updates.email = accountData.email;
      if (accountData.password) updates.password = accountData.password;
      
      if (Object.keys(updates).length > 0) {
        try {
          await updateAdminAccount(user.id, updates);
        } catch (e) {
          console.error("Lỗi cập nhật tài khoản", e);
          alert("Không thể cập nhật thông tin tài khoản.");
        }
      }
    }

    // Save site settings
    const finalSettings: Setting[] = [];
    
    DEFAULT_KEYS.forEach(dk => {
      if (settingsMap[dk.key] !== undefined) {
        finalSettings.push({ key: dk.key, value: settingsMap[dk.key] });
      }
    });

    STATS_KEYS.forEach(sk => {
      if (settingsMap[sk.key] !== undefined) {
        finalSettings.push({ key: sk.key, value: settingsMap[sk.key] });
      }
    });

    FEATURES_KEYS.forEach(fk => {
      if (settingsMap[fk.titleKey] !== undefined) {
        finalSettings.push({ key: fk.titleKey, value: settingsMap[fk.titleKey] });
      }
      if (settingsMap[fk.descKey] !== undefined) {
        finalSettings.push({ key: fk.descKey, value: settingsMap[fk.descKey] });
      }
    });

    try {
      await saveSettings(finalSettings);
      alert("Đã lưu cài đặt hệ thống thành công!");
      if (accountData.password) {
        setAccountData(prev => ({ ...prev, password: "" })); // Clear password field after save
      }
    } catch (e) {
      console.error(e);
      alert("Không thể lưu cài đặt trang web.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-navy dark:text-white">Cấu hình Hệ thống</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý thông tin liên hệ, chỉ số trang chủ và tài khoản cá nhân.</p>
        </div>
        <Button 
          className="bg-orange hover:bg-orange-hover text-white shadow-lg shadow-orange/20 font-semibold" 
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
        </Button>
      </div>

      <div className="grid gap-6">
        
        {/* Account Settings */}
        {user && (
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0f172a]">
            <CardHeader>
              <CardTitle>Thông tin Tài khoản Quản trị</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn. Để trống mật khẩu nếu không muốn thay đổi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Họ và tên</label>
                <Input 
                  type="text" 
                  placeholder="Tên quản trị viên"
                  value={accountData.name}
                  onChange={e => setAccountData(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Địa chỉ Email</label>
                <Input 
                  type="email" 
                  placeholder="admin@aec.edu.vn"
                  value={accountData.email}
                  onChange={e => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                  className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mật khẩu mới</label>
                <Input 
                  type="password" 
                  placeholder="Nhập mật khẩu mới..."
                  value={accountData.password}
                  onChange={e => setAccountData(prev => ({ ...prev, password: e.target.value }))}
                  className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Standard Settings */}
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0f172a]">
          <CardHeader>
            <CardTitle>Thông tin Liên hệ & Footer</CardTitle>
            <CardDescription>Các thông tin liên lạc hiển thị công khai trên giao diện người dùng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEFAULT_KEYS.map((item) => (
              <div key={item.key} className="grid gap-2">
                <label className="text-sm font-semibold flex items-center text-slate-700 dark:text-slate-300">
                  {item.label} 
                  <span className="text-xs text-slate-400 ml-2 font-normal">({item.key})</span>
                </label>
                {item.key === "footer_text" || item.key === "address" ? (
                  <Textarea 
                    placeholder={item.placeholder}
                    value={settingsMap[item.key] || ""}
                    onChange={e => handleStandardChange(item.key, e.target.value)}
                    rows={2}
                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 resize-none"
                  />
                ) : (
                  <Input 
                    type="text" 
                    placeholder={item.placeholder}
                    value={settingsMap[item.key] || ""}
                    onChange={e => handleStandardChange(item.key, e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80"
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Home Page Stats */}
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0f172a]">
          <CardHeader>
            <CardTitle>Chỉ số ấn tượng Trang chủ</CardTitle>
            <CardDescription>Các con số thống kê nổi bật hiển thị ở giao diện chính.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            {STATS_KEYS.map((item) => (
              <div key={item.key} className="grid gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.label}</label>
                <Input 
                  type="text" 
                  placeholder={item.placeholder}
                  value={settingsMap[item.key] || ""}
                  onChange={e => handleStandardChange(item.key, e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Feature Cards (Why Choose Us & Vision/Mission) */}
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0f172a]">
          <CardHeader>
            <CardTitle>Đặc điểm nổi bật & Tầm nhìn</CardTitle>
            <CardDescription>Tùy chỉnh nội dung 4 thẻ giới thiệu giá trị cốt lõi của học viện trên trang chủ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {FEATURES_KEYS.map((fk, idx) => (
                <div key={fk.prefix} className="grid gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <h5 className="text-sm font-bold text-navy dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange/10 text-orange flex items-center justify-center text-xs">{idx + 1}</span>
                    Mục {idx + 1}
                  </h5>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiêu đề thẻ</label>
                    <Input 
                      type="text" 
                      placeholder={fk.defaultTitle}
                      value={settingsMap[fk.titleKey] || ""}
                      onChange={e => handleStandardChange(fk.titleKey, e.target.value)}
                      className="bg-white dark:bg-slate-900 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nội dung chi tiết</label>
                    <Textarea 
                      rows={3} 
                      placeholder={fk.defaultDesc}
                      value={settingsMap[fk.descKey] || ""}
                      onChange={e => handleStandardChange(fk.descKey, e.target.value)}
                      className="bg-white dark:bg-slate-900 resize-none rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
            <Button 
              className="bg-orange hover:bg-orange-hover text-white shadow-lg shadow-orange/20 font-semibold" 
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
