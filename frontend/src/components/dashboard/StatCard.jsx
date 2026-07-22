function StatCard({
  label,
  value,
  icon: Icon,
  loading = false,
  accent = "orange",
  helper,
}) {
  const accents = {
    orange: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
    amber: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    purple: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#20252D] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.14)] transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-500/[0.05] blur-2xl opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-[10px]">
            {label}
          </p>
          {loading ? (
            <div className="mt-3 h-7 w-24 animate-pulse rounded-lg bg-white/[0.06]" />
          ) : (
            <p className="mt-2 truncate text-xl font-black tracking-[-0.04em] text-white sm:text-2xl">
              {value}
            </p>
          )}
          {helper && (
            <p className="mt-1 truncate text-[10px] text-zinc-600">{helper}</p>
          )}
        </div>
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${accents[accent] || accents.orange}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </article>
  );
}

export default StatCard;
