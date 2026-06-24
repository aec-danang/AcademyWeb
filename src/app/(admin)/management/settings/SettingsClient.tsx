"use client";

import { useState } from "react";
import { saveSettings, updateAdminAccount } from "./actions";
import { Plus, Trash2, Save } from "lucide-react";
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
  { key: "contact_email", label: "Contact Email", placeholder: "contact@example.com" },
  { key: "contact_phone", label: "Contact Phone", placeholder: "+1 234 567 890" },
  { key: "facebook_url", label: "Facebook URL", placeholder: "https://facebook.com/..." },
  { key: "address", label: "Physical Address", placeholder: "123 Street Name..." },
  { key: "footer_text", label: "Footer Text", placeholder: "© 2026 Academy English Center..." },
];

export default function SettingsClient({ initialSettings, user }: { initialSettings: Setting[], user?: UserInfo }) {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>(
    initialSettings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
  );

  const [customSettings, setCustomSettings] = useState<Setting[]>(
    initialSettings.filter(s => !DEFAULT_KEYS.some(dk => dk.key === s.key))
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

  const handleCustomChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...customSettings];
    updated[index][field] = val;
    setCustomSettings(updated);
  };

  const addCustomSetting = () => {
    setCustomSettings([...customSettings, { key: "", value: "" }]);
  };

  const removeCustomSetting = (index: number) => {
    const updated = [...customSettings];
    updated.splice(index, 1);
    setCustomSettings(updated);
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
          console.error("Failed to update account", e);
          alert("Failed to update account information.");
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

    customSettings.forEach(cs => {
      if (cs.key && cs.key.trim() !== "") {
        finalSettings.push({ key: cs.key.trim(), value: cs.value });
      }
    });

    try {
      await saveSettings(finalSettings);
      alert("Settings saved successfully!");
      if (accountData.password) {
        setAccountData(prev => ({ ...prev, password: "" })); // Clear password field after save
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save site settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-navy dark:text-white">Settings</h2>
        <Button 
          className="bg-orange hover:bg-orange-hover text-white" 
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      <div className="grid gap-6">
        
        {/* Account Settings */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your admin profile. Leave password blank to keep it unchanged.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  type="text" 
                  placeholder="Admin Name"
                  value={accountData.name}
                  onChange={e => setAccountData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email" 
                  placeholder="admin@example.com"
                  value={accountData.email}
                  onChange={e => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">New Password</label>
                <Input 
                  type="password" 
                  placeholder="Enter new password..."
                  value={accountData.password}
                  onChange={e => setAccountData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Standard Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Settings</CardTitle>
            <CardDescription>Core contact info and basic site details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEFAULT_KEYS.map((item) => (
              <div key={item.key} className="grid gap-2">
                <label className="text-sm font-medium flex items-center">
                  {item.label} 
                  <span className="text-xs text-muted-foreground ml-2 font-normal">({item.key})</span>
                </label>
                {item.key === "footer_text" || item.key === "address" ? (
                  <Textarea 
                    placeholder={item.placeholder}
                    value={settingsMap[item.key] || ""}
                    onChange={e => handleStandardChange(item.key, e.target.value)}
                    rows={2}
                  />
                ) : (
                  <Input 
                    type="text" 
                    placeholder={item.placeholder}
                    value={settingsMap[item.key] || ""}
                    onChange={e => handleStandardChange(item.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Landing Page Content */}
        <Card>
          <CardHeader>
            <CardTitle>Landing Page Content</CardTitle>
            <CardDescription>Configure text and imagery for the public site's homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Hero Section</h4>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Hero Headline</label>
                <Input type="text" defaultValue="Learn English. Build Confidence. Become a Global Citizen." />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Hero Subheadline</label>
                <Textarea rows={3} defaultValue="Join AEC Da Nang to unlock your potential with our expert teachers and proven methodology." />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Hero Background Image URL</label>
                <Input type="text" defaultValue="/images/hero-bg.jpg" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">About Us Section</h4>
              <div className="grid gap-2">
                <label className="text-sm font-medium">About Heading</label>
                <Input type="text" defaultValue="Why Choose Academy English Center?" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">About Description</label>
                <Textarea rows={5} defaultValue="At AEC, we believe that learning English is more than just passing exams; it's about connecting with the world..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Variables */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Custom Settings</CardTitle>
              <CardDescription>Add custom variables not covered by standard settings.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addCustomSetting}>
              <Plus className="mr-2 h-4 w-4" />
              Add Variable
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customSettings.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-slate-50 dark:bg-slate-900/50">
                  No custom settings defined. Click "Add Variable" to create one.
                </div>
              ) : (
                customSettings.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="grid gap-2 flex-1">
                      <label className="text-xs font-medium">Key</label>
                      <Input 
                        type="text" 
                        placeholder="custom_key"
                        value={item.key}
                        onChange={e => handleCustomChange(index, "key", e.target.value)}
                        className="font-mono bg-white dark:bg-slate-950"
                      />
                    </div>
                    <div className="grid gap-2 flex-[2]">
                      <label className="text-xs font-medium">Value</label>
                      <Input 
                        type="text" 
                        placeholder="Value..."
                        value={item.value}
                        onChange={e => handleCustomChange(index, "value", e.target.value)}
                        className="bg-white dark:bg-slate-950"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="mt-6 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                      onClick={() => removeCustomSetting(index)}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
