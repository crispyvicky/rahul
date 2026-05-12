"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, LogOut, Save, Camera } from "lucide-react";
import { useUserStore, DEMO_USER } from "@/store/use-user-store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, updateProfile, logout } = useUserStore();
  const currentUser = user || DEMO_USER;
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [instagram, setInstagram] = useState(currentUser.instagramHandle);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ name, email, instagramHandle: instagram });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20 max-w-2xl">
      <div>
        <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter font-heading">
          Settings
        </h1>
        <p className="text-text-secondary text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-2xl font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-surface-elevated border border-white/10 rounded-lg flex items-center justify-center text-text-muted hover:text-white transition-colors">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <p className="text-white font-bold">{currentUser.name}</p>
          <p className="text-text-muted text-xs capitalize">{currentUser.premiumTier} Plan</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-surface-card border border-white/5 rounded-2xl p-5 space-y-5">
        <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <User className="w-4 h-4 text-brand" /> Profile
        </h3>
        <div className="space-y-4">
          {[
            { label: "Name", value: name, setter: setName, type: "text" },
            { label: "Email", value: email, setter: setEmail, type: "email" },
            { label: "Instagram", value: instagram, setter: setInstagram, type: "text" },
          ].map((field) => (
            <div key={field.label} className="space-y-1.5">
              <label className="text-text-muted text-[10px] font-bold uppercase tracking-[0.2em]">{field.label}</label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all",
            saved
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-brand hover:bg-brand-dark text-white"
          )}
        >
          {saved ? <><Save className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-surface-card border border-red-500/10 rounded-2xl p-5">
        <h3 className="text-brand font-bold text-sm uppercase tracking-widest mb-3">Danger Zone</h3>
        <button
          onClick={() => { logout(); window.location.href = "/"; }}
          className="px-5 py-3 bg-brand/10 border border-brand/20 text-brand font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-brand/20 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
