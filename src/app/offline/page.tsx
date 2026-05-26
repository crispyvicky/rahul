"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-white text-2xl font-black uppercase tracking-tight font-heading mb-2">
        Connection lost
      </h1>
      <p className="text-[#96979c] text-sm max-w-sm mb-8">
        RahulFitzz needs internet for sync and AI. Your saved Gym Mode plan may still work once you reload with signal.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest"
        >
          Reload
        </button>
        <a
          href="/gym-mode"
          className="px-6 py-3 border border-white/20 text-white text-xs font-bold uppercase tracking-widest no-underline text-center"
        >
          Open Gym Mode
        </a>
        <a
          href="/dashboard"
          className="px-6 py-3 bg-[#eb0000] text-white text-xs font-bold uppercase tracking-widest no-underline text-center"
        >
          Dashboard
        </a>
      </div>
    </div>
  );
}
