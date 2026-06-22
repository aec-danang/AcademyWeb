"use client";

import { useState } from "react";
import { saveSettings, updateAdminAccount } from "./actions";
import styles from "../admin.module.css";
import { Plus, Trash2, Save } from "lucide-react";

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
    <div>
      <div className={styles.flexBetween} style={{ alignItems: "center", marginBottom: "2rem" }}>
        <h2 style={{ margin: 0 }}>Settings</h2>
        <button 
          className="btn-primary" 
          onClick={handleSave}
          disabled={isSaving}
          style={{ display: "flex", gap: "0.5rem", alignItems: "center", opacity: isSaving ? 0.7 : 1 }}
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save All Settings"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        
        {/* Account Settings */}
        {user && (
          <div className={styles.cardPanel}>
            <h3 style={{ marginBottom: "0.5rem" }}>Account Information</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Manage your admin profile. Leave password blank to keep it unchanged.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Name</label>
                <input 
                  type="text" 
                  placeholder="Admin Name"
                  value={accountData.name}
                  onChange={e => setAccountData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="admin@example.com"
                  value={accountData.email}
                  onChange={e => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password..."
                  value={accountData.password}
                  onChange={e => setAccountData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Standard Settings */}
        <div className={styles.cardPanel}>
          <h3 style={{ marginBottom: "0.5rem" }}>Standard Settings</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Core contact info and basic site details.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {DEFAULT_KEYS.map((item) => (
              <div key={item.key} className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>{item.label} <span style={{ color: "#94a3b8", fontWeight: "normal", fontSize: "0.85rem", marginLeft: "0.5rem" }}>({item.key})</span></label>
                {item.key === "footer_text" || item.key === "address" ? (
                  <textarea 
                    placeholder={item.placeholder}
                    value={settingsMap[item.key] || ""}
                    onChange={e => handleStandardChange(item.key, e.target.value)}
                    rows={2}
                  />
                ) : (
                  <input 
                    type="text" 
                    placeholder={item.placeholder}
                    value={settingsMap[item.key] || ""}
                    onChange={e => handleStandardChange(item.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Landing Page Content */}
        <div className={styles.cardPanel}>
          <h3 style={{ marginBottom: "0.5rem" }}>Landing Page Content</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1rem" }}>Configure text and imagery for the public site's homepage.</p>
          
          <form style={{ marginTop: "1.5rem" }} onSubmit={(e) => e.preventDefault()}>
            <h4 style={{ marginBottom: "1rem", color: "#334155" }}>Hero Section</h4>
            <div className={styles.formGroup}>
              <label>Hero Headline</label>
              <input type="text" defaultValue="Learn English. Build Confidence. Become a Global Citizen." />
            </div>
            <div className={styles.formGroup}>
              <label>Hero Subheadline</label>
              <textarea rows={3} defaultValue="Join AEC Da Nang to unlock your potential with our expert teachers and proven methodology."></textarea>
            </div>
            <div className={styles.formGroup}>
              <label>Hero Background Image URL</label>
              <input type="text" defaultValue="/images/hero-bg.jpg" />
            </div>

            <h4 style={{ margin: "2rem 0 1rem", color: "#334155" }}>About Us Section</h4>
            <div className={styles.formGroup}>
              <label>About Heading</label>
              <input type="text" defaultValue="Why Choose Academy English Center?" />
            </div>
            <div className={styles.formGroup}>
              <label>About Description</label>
              <textarea rows={5} defaultValue="At AEC, we believe that learning English is more than just passing exams; it's about connecting with the world..."></textarea>
            </div>
          </form>
        </div>

        {/* Custom Variables */}
        <div className={styles.cardPanel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>Custom Settings</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>Add custom variables not covered by standard settings.</p>
            </div>
            <button 
              className="btn-secondary" 
              onClick={addCustomSetting}
              style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              <Plus size={16} />
              Add Variable
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {customSettings.length === 0 ? (
              <div style={{ color: "#94a3b8", textAlign: "center", padding: "2rem", border: "1px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc" }}>
                No custom settings defined. Click "Add Variable" to create one.
              </div>
            ) : (
              customSettings.map((item, index) => (
                <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", background: "#f8fafc", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                    <label style={{ fontSize: "0.8rem", marginBottom: "0.25rem", display: "block" }}>Key</label>
                    <input 
                      type="text" 
                      placeholder="custom_key"
                      value={item.key}
                      onChange={e => handleCustomChange(index, "key", e.target.value)}
                      style={{ fontFamily: "monospace", background: "#fff" }}
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 2, marginBottom: 0 }}>
                    <label style={{ fontSize: "0.8rem", marginBottom: "0.25rem", display: "block" }}>Value</label>
                    <input 
                      type="text" 
                      placeholder="Value..."
                      value={item.value}
                      onChange={e => handleCustomChange(index, "value", e.target.value)}
                      style={{ background: "#fff" }}
                    />
                  </div>
                  <button 
                    onClick={() => removeCustomSetting(index)}
                    style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fca5a5", borderRadius: "8px", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: "1.4rem", transition: "all 0.2s" }}
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
