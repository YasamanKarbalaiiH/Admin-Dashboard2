"use client";

import { useState } from "react";
import { Check, Edit, Mail, MapPin, Phone, User, X } from "lucide-react";

type Profile = {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  joined: string;
};

type ProfileClientProps = {
  initialProfile: Profile;
};

export default function ProfileClient({ initialProfile }: ProfileClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (field: keyof Profile, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setForm(profile);
    setMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(profile);
    setMessage("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = (await response.json()) as Profile;

      setProfile(updatedProfile);
      setForm(updatedProfile);
      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Profile</h1>

        <p className="mt-1 text-sm text-text-secondary">
          Manage your personal information and account details.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <div className="bg-primary px-5 py-8 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-bold text-primary shadow-sm">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>

              <p className="mt-1 text-sm text-white/80">{profile.role}</p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Personal Information
              </h3>

              <p className="mt-1 text-sm text-text-secondary">
                Your account information and contact details.
              </p>
            </div>

            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark sm:w-auto"
              >
                <Edit size={17} />
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-success-light px-4 py-3 text-sm font-medium text-success">
              <Check size={18} />
              {message}
            </div>
          )}

          {!isEditing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard
                icon={<User size={19} />}
                label="Full Name"
                value={profile.name}
              />

              <InfoCard
                icon={<User size={19} />}
                label="Role"
                value={profile.role}
              />

              <InfoCard
                icon={<Mail size={19} />}
                label="Email"
                value={profile.email}
              />

              <InfoCard
                icon={<Phone size={19} />}
                label="Phone"
                value={profile.phone}
              />

              <InfoCard
                icon={<MapPin size={19} />}
                label="Location"
                value={profile.location}
              />

              <InfoCard
                icon={<User size={19} />}
                label="Joined"
                value={profile.joined}
              />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label="Full Name"
                  value={form.name}
                  onChange={(value) => handleChange("name", value)}
                />

                <FormField
                  label="Role"
                  value={form.role}
                  disabled
                  onChange={(value) => handleChange("role", value)}
                />

                <FormField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) => handleChange("email", value)}
                />

                <FormField
                  label="Phone"
                  value={form.phone}
                  onChange={(value) => handleChange("phone", value)}
                />

                <FormField
                  label="Location"
                  value={form.location}
                  onChange={(value) => handleChange("location", value)}
                />

                <FormField
                  label="Joined"
                  value={form.joined}
                  disabled
                  onChange={(value) => handleChange("joined", value)}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={17} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center gap-2 text-text-muted">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="wrap-break-word text-sm font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  type?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function FormField({
  label,
  value,
  type = "text",
  disabled = false,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-primary">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-background disabled:text-text-muted"
      />
    </div>
  );
}
