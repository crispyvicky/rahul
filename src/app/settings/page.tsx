"use client";

import { useEffect, useState } from "react";
import { User, Save, Camera, LogOut } from "lucide-react";
import { useUserStore, DEMO_USER } from "@/store/use-user-store";
import { cn } from "@/lib/utils";
import { mapDbProfileToStore } from "@/lib/user-profile-mapper";
import { isUuidUserId } from "@/lib/api-guards";
import {
  loadVoiceShoutoutSettings,
  saveVoiceShoutoutSettings,
  type VoicePreference,
} from "@/lib/voice-shoutout-settings";
import {
  loadNotificationPreferences,
  requestNotificationPermission,
  saveNotificationPreferences,
  dispatchNotificationPermissionUpdated,
} from "@/lib/engagement-notifications";

export default function SettingsPage() {
  const { user, updateProfile, login, logout } = useUserStore();
  const currentUser = user || DEMO_USER;
  const [name, setName] = useState(currentUser.name);
  const [email] = useState(currentUser.email);
  const [instagram, setInstagram] = useState(currentUser.instagramHandle);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voicePreference, setVoicePreference] = useState<VoicePreference>("auto");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const settings = loadVoiceShoutoutSettings();
    setVoiceEnabled(settings.enabled);
    setVoicePreference(settings.voicePreference);
    const n = loadNotificationPreferences();
    setNotificationsEnabled(n.enabled);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    if (!isUuidUserId(currentUser.id)) {
      updateProfile({ name, instagramHandle: instagram });
      saveVoiceShoutoutSettings({
        enabled: voiceEnabled,
        voicePreference,
      });
      saveNotificationPreferences({
        enabled: notificationsEnabled,
      });
      dispatchNotificationPermissionUpdated();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          name,
          instagram_handle: instagram,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not save");
        return;
      }
      if (json.profile) {
        login(mapDbProfileToStore(json.profile));
      } else {
        updateProfile({ name, instagramHandle: instagram });
      }
      saveVoiceShoutoutSettings({
        enabled: voiceEnabled,
        voicePreference,
      });
      saveNotificationPreferences({
        enabled: notificationsEnabled,
      });
      dispatchNotificationPermissionUpdated();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20 max-w-2xl">
      <div>
        <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter font-heading">
          Settings
        </h1>
        <p className="text-text-secondary text-sm mt-1">Manage your profile and preferences</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-2xl font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <button
            type="button"
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-surface-elevated border border-white/10 rounded-lg flex items-center justify-center text-text-muted hover:text-white transition-colors"
            aria-label="Change avatar"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <p className="text-white font-bold">{currentUser.name}</p>
          <p className="text-text-muted text-xs capitalize">{currentUser.premiumTier} Plan</p>
        </div>
      </div>

      <div className="bg-surface-card border border-white/5 rounded-2xl p-5 space-y-5">
        <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <User className="w-4 h-4 text-brand" /> Profile
        </h3>
        <div className="space-y-4">
          {[
            { label: "Name", value: name, setter: setName, type: "text", disabled: false },
            { label: "Email", value: email, setter: () => {}, type: "email", disabled: true },
            { label: "Instagram", value: instagram, setter: setInstagram, type: "text", disabled: false },
          ].map((field) => (
            <div key={field.label} className="space-y-1.5">
              <label className="text-text-muted text-[10px] font-bold uppercase tracking-[0.2em]">
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                disabled={field.disabled}
                onChange={(e) => field.setter(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand transition-colors",
                  field.disabled && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>
          ))}
        </div>
        {error && <p className="text-brand text-xs">{error}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50",
            saved
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-brand hover:bg-brand-dark text-white"
          )}
        >
          {saved ? (
            <>
              <Save className="w-4 h-4" /> Saved!
            </>
          ) : saving ? (
            "Saving…"
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </button>
      </div>

      <div className="bg-surface-card border border-white/5 rounded-2xl p-5 space-y-5">
        <h3 className="text-white font-bold text-sm uppercase tracking-widest">
          App Notifications
        </h3>
        <p className="text-text-muted text-xs leading-relaxed">
          Catchy gym nudges, giveaway alerts, and points updates. Default is subscribed.
        </p>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="text-white text-sm font-bold">Enable app notifications</p>
            <p className="text-text-muted text-xs">
              Turn off only if you do not want motivational reminders.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            onClick={() => setNotificationsEnabled((v) => !v)}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors",
              notificationsEnabled ? "bg-brand" : "bg-white/20"
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
                notificationsEnabled ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
        <button
          type="button"
          onClick={() => requestNotificationPermission()}
          className="px-4 py-2 rounded-xl border border-brand/30 bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest"
        >
          Ask Browser Permission
        </button>
      </div>

      <div className="bg-surface-card border border-white/5 rounded-2xl p-5 space-y-5">
        <h3 className="text-white font-bold text-sm uppercase tracking-widest">
          Voice Shoutouts
        </h3>
        <p className="text-text-muted text-xs leading-relaxed">
          Control spoken dashboard welcomes (morning/evening motivation, English + Telugu mix).
        </p>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="text-white text-sm font-bold">Enable voice shoutouts</p>
            <p className="text-text-muted text-xs">
              Plays one motivational welcome after opening dashboard.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={voiceEnabled}
            onClick={() => setVoiceEnabled((v) => !v)}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors",
              voiceEnabled ? "bg-brand" : "bg-white/20"
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
                voiceEnabled ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-text-muted text-[10px] font-bold uppercase tracking-[0.2em]">
            Voice Preference
          </label>
          <select
            value={voicePreference}
            onChange={(e) => setVoicePreference(e.target.value as VoicePreference)}
            disabled={!voiceEnabled}
            className={cn(
              "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand transition-colors",
              !voiceEnabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <option value="auto">Auto (recommended)</option>
            <option value="male">Prefer male voice</option>
            <option value="female">Prefer female voice</option>
          </select>
        </div>
      </div>

      <div className="bg-surface-card border border-red-500/10 rounded-2xl p-5">
        <h3 className="text-brand font-bold text-sm uppercase tracking-widest mb-3">Danger Zone</h3>
        <button
          type="button"
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
          className="px-5 py-3 bg-brand/10 border border-brand/20 text-brand font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-brand/20 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
