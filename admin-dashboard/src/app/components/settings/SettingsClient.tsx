"use client";

import { useState } from "react";
import { Check, Mail, Save, Smartphone } from "lucide-react";

type Settings = {
  emailNotifications: boolean;
  pushNotifications: boolean;
};

type SettingsClientProps = {
  initialSettings: Settings;
};

export default function SettingsClient({
  initialSettings,
}: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const toggleSetting = (field: keyof Settings) => {
    setSettings((current) => ({
      ...current,
      [field]: !current[field],
    }));

    setMessage("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      const updatedSettings = (await response.json()) as Settings;

      setSettings(updatedSettings);
      setMessage("Settings saved successfully.");
    } catch {
      setMessage("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

        <p className="mt-1 text-sm text-text-secondary">
          Manage your application preferences and notifications.
        </p>
      </div>

      <div className="space-y-6">
        <SettingSection
          title="Notifications"
          description="Choose how you want to receive notifications."
        >
          <SettingRow
            icon={<Mail size={19} />}
            title="Email Notifications"
            description="Receive important updates and account notifications by email."
            enabled={settings.emailNotifications}
            onToggle={() => toggleSetting("emailNotifications")}
          />

          <SettingRow
            icon={<Smartphone size={19} />}
            title="Push Notifications"
            description="Receive notifications directly in your browser."
            enabled={settings.pushNotifications}
            onToggle={() => toggleSetting("pushNotifications")}
          />
        </SettingSection>

        {message && (
          <div className="flex items-center gap-2 rounded-xl bg-success-light px-4 py-3 text-sm font-medium text-success">
            <Check size={18} />
            {message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Save size={17} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </section>
  );
}

type SettingSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function SettingSection({ title, description, children }: SettingSectionProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-5 py-5 sm:px-7">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>

        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>

      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

type SettingRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};

function SettingRow({
  icon,
  title,
  description,
  enabled,
  onToggle,
}: SettingRowProps) {
  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
