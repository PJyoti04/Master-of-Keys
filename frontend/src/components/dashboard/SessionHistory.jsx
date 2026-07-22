import {
  CalendarDays,
  ChevronRight,
  Clock,
  Gamepad2,
  Keyboard,
  Target,
  Trophy,
  Users,
} from "lucide-react";

function formatDate(date) {
  if (!date) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatDuration(seconds) {
  const value = Number(seconds) || 0;
  if (value <= 0) return "Not recorded";
  if (value < 60) return `${value}s`;
  const minutes = Math.floor(value / 60);
  const remaining = value % 60;
  return remaining ? `${minutes}m ${remaining}s` : `${minutes} min`;
}

function SessionHistory({
  sessions,
  activeTab,
  loading,
  hasMore,
  onTabChange,
  onLoadMore,
  onSessionClick,
}) {
  return (
    <div id="session-history">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-400">
            Session library
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.02em]">
            Review every run
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Open a result to inspect speed, accuracy, mistakes, and rankings.
          </p>
        </div>
        <div className="grid grid-cols-2 rounded-xl border border-white/[0.05] bg-[#181C22] p-1">
          <button
            type="button"
            onClick={() => onTabChange("practice")}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${activeTab === "practice" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/15" : "text-zinc-500 hover:text-white"}`}
          >
            <Keyboard size={14} />
            Practice
          </button>
          <button
            type="button"
            onClick={() => onTabChange("rooms")}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${activeTab === "rooms" ? "bg-violet-500 text-white shadow-lg shadow-violet-500/15" : "text-zinc-500 hover:text-white"}`}
          >
            <Gamepad2 size={14} />
            Rooms
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {loading && sessions.length === 0 ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-[94px] animate-pulse rounded-2xl bg-white/[0.03]"
            />
          ))
        ) : sessions.length > 0 ? (
          sessions.map((session) => (
            <button
              type="button"
              key={`${session.type}-${session.id}`}
              onClick={() => onSessionClick(session)}
              className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#181C22] p-3 text-left transition duration-300 hover:-translate-y-0.5 hover:border-orange-500/20 hover:bg-[#1B2027] sm:p-4"
            >
              <span
                className={`absolute inset-y-3 left-0 w-0.5 rounded-r-full ${session.type === "room" ? "bg-violet-500" : "bg-orange-500"}`}
              />
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ${session.type === "room" ? "bg-violet-500/10 text-violet-400 ring-violet-500/20" : "bg-orange-500/10 text-orange-400 ring-orange-500/20"}`}
              >
                {session.type === "room" ? (
                  <Gamepad2 size={20} />
                ) : (
                  <Keyboard size={20} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-white">
                    {session.type === "room"
                      ? session.roomName || "Multiplayer race"
                      : "Practice session"}
                  </p>
                  {session.type === "room" && session.rank && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-400 ring-1 ring-amber-500/15">
                      <Trophy size={9} />#{session.rank}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-zinc-500 sm:text-[10px]">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={11} />
                    {formatDate(session.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} />
                    {formatDuration(session.duration)}
                  </span>
                  {session.type === "room" && session.playerCount ? (
                    <span className="inline-flex items-center gap-1">
                      <Users size={11} />
                      {session.playerCount} players
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="hidden shrink-0 items-center gap-6 sm:flex">
                <div className="text-right">
                  <p className="text-base font-black text-white">
                    {Math.round(session.wpm || 0)}
                  </p>
                  <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                    WPM
                  </p>
                </div>
                <div className="text-right">
                  <p className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400">
                    <Target size={12} />
                    {Math.round(session.accuracy || 0)}%
                  </p>
                  <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-600">
                    Accuracy
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right sm:hidden">
                <p className="text-sm font-black">
                  {Math.round(session.wpm || 0)}
                </p>
                <p className="text-[8px] text-zinc-600">WPM</p>
              </div>
              <ChevronRight
                size={17}
                className="shrink-0 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-orange-400"
              />
            </button>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.07] bg-[#181C22] px-5 py-14 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.03] text-zinc-700">
              {activeTab === "practice" ? (
                <Keyboard size={23} />
              ) : (
                <Gamepad2 size={23} />
              )}
            </div>
            <p className="mt-4 font-medium text-zinc-300">
              No {activeTab === "practice" ? "practice sessions" : "rooms"} yet
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Complete a run and it will appear here.
            </p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="rounded-xl bg-orange-500 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-orange-500/15 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more sessions"}
          </button>
        </div>
      )}
    </div>
  );
}

export default SessionHistory;
