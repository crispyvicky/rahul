export type VoicePreference = "auto" | "male" | "female";

export type VoiceShoutoutSettings = {
  enabled: boolean;
  voicePreference: VoicePreference;
};

export const VOICE_SHOUTOUT_SETTINGS_KEY = "rahulfitzz_voice_settings_v1";

export const DEFAULT_VOICE_SHOUTOUT_SETTINGS: VoiceShoutoutSettings = {
  enabled: true,
  voicePreference: "auto",
};

export function loadVoiceShoutoutSettings(): VoiceShoutoutSettings {
  if (typeof window === "undefined") return DEFAULT_VOICE_SHOUTOUT_SETTINGS;

  try {
    const raw = localStorage.getItem(VOICE_SHOUTOUT_SETTINGS_KEY);
    if (!raw) return DEFAULT_VOICE_SHOUTOUT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<VoiceShoutoutSettings>;

    const enabled = typeof parsed.enabled === "boolean"
      ? parsed.enabled
      : DEFAULT_VOICE_SHOUTOUT_SETTINGS.enabled;

    const voicePreference =
      parsed.voicePreference === "male" ||
      parsed.voicePreference === "female" ||
      parsed.voicePreference === "auto"
        ? parsed.voicePreference
        : DEFAULT_VOICE_SHOUTOUT_SETTINGS.voicePreference;

    return { enabled, voicePreference };
  } catch {
    return DEFAULT_VOICE_SHOUTOUT_SETTINGS;
  }
}

export function saveVoiceShoutoutSettings(settings: VoiceShoutoutSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOICE_SHOUTOUT_SETTINGS_KEY, JSON.stringify(settings));
}
