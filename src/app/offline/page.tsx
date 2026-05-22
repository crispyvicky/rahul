export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-white text-2xl font-black uppercase tracking-tight font-heading mb-2">
        You&apos;re offline
      </h1>
      <p className="text-[#96979c] text-sm max-w-sm">
        RahulFitzz needs a connection for AI plans and sync. Cached gym plans still work in Gym Mode when available.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
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
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
