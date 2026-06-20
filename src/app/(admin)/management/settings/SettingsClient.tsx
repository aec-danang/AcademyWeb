"use client";

import { useState } from "react";
import { saveSettings } from "./actions";
import styles from "../admin.module.css";
import { Plus, Trash2, Save } from "lucide-react";

type Setting = {
  key: string;
  value: string;
};

const DEFAULT_KEYS = [
  { key: "contact_email", label: "Contact Email", placeholder: "contact@example.com" },
  { key: "contact_phone", label: "Contact Phone", placeholder: "+1 234 567 890" },
  { key: "facebook_url", label: "Facebook URL", placeholder: "https://facebook.com/..." },
  { key: "address", label: "Physical Address", placeholder: "123 Street Name..." },
  { key: "footer_text", label: "Footer Text", placeholder: "© 2026 Academy English Center..." },
];

export default function SettingsClient({ initialSettings }: { initialSettings: Setting[] }) {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>(
    initialSettings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
  );

  const [customSettings, setCustomSettings] = useState<Setting[]>(
    initialSettings.filter(s => !DEFAULT_KEYS.some(dk => dk.key === s.key))
  );

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
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.flexBetween} style={{ alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Global Settings</h2>
        <button 
          className="btn-primary" 
          onClick={handleSave}
          disabled={isSaving}
          style={{ display: "flex", gap: "0.5rem", alignItems: "center", opacity: isSaving ? 0.7 : 1 }}
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className={styles.cardPanel} style={{ marginBottom: "2rem" }}>
        <h3>Standard Settings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}>
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

      <div className={styles.cardPanel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0 }}>Custom Settings</h3>
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
            <div style={{ color: "#94a3b8", textAlign: "center", padding: "2rem", border: "1px dashed #cbd5e1", borderRadius: "12px" }}>
              No custom settings defined. Click "Add Variable" to create one.
            </div>
          ) : (
            customSettings.map((item, index) => (
              <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                  <input 
                    type="text" 
                    placeholder="custom_key"
                    value={item.key}
                    onChange={e => handleCustomChange(index, "key", e.target.value)}
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 2, marginBottom: 0 }}>
                  <input 
                    type="text" 
                    placeholder="Value..."
                    value={item.value}
                    onChange={e => handleCustomChange(index, "value", e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => removeCustomSetting(index)}
                  style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "12px", width: "46px", height: "46px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
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
  );
}
