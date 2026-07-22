import {
  CheckCircle2,
  Clock,
  Crown,
  Delete,
  Keyboard,
  Medal,
  Target,
  Trophy,
  Users,
  X,
  XCircle,
} from "lucide-react";

const duration = (seconds) => {
  const value = Number(seconds) || 0;
  if (value <= 0) return "Not recorded";
  if (value < 60) return `${value}s`;
  const minutes = Math.floor(value / 60);
  const remaining = value % 60;
  return remaining ? `${minutes}m ${remaining}s` : `${minutes} min`;
};

function MiniStat({ label, value, icon: Icon, tone = "orange" }) {
  const tones = {
    orange: "text-orange-400 bg-orange-500/10",
    green: "text-emerald-400 bg-emerald-500/10",
    red: "text-red-400 bg-red-500/10",
    amber: "text-amber-400 bg-amber-500/10",
  };
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-[#181C22] p-3">
      <div
        className={`grid h-8 w-8 place-items-center rounded-lg ${tones[tone] || tones.orange}`}
      >
        <Icon size={15} />
      </div>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
      <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </p>
    </div>
  );
}

function SessionDetailsModal({
  open,
  selectedSession,
  details,
  loading,
  onClose,
}) {
  if (!open) return null;
  const isRoom = selectedSession?.type === "room";
  const result = details?.playerResult || details || {};

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative z-10 max-h-[94dvh] w-full overflow-y-auto rounded-t-[28px] border border-white/[0.08] bg-[#20252D] shadow-[0_30px_100px_rgba(0,0,0,0.55)] sm:max-w-4xl sm:rounded-[28px]">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.07] bg-[#20252D]/95 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-400">
              {isRoom ? "Race report" : "Practice report"}
            </p>
            <h2 className="mt-1 truncate text-lg font-bold sm:text-xl">
              {isRoom
                ? details?.roomName || "Multiplayer race"
                : "Practice session"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-xl bg-[#181C22] text-zinc-400 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="space-y-3">
              <div className="h-32 animate-pulse rounded-2xl bg-white/[0.03]" />
              <div className="h-56 animate-pulse rounded-2xl bg-white/[0.03]" />
            </div>
          ) : details ? (
            <>
              <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-orange-500/[0.10] via-[#181C22] to-[#181C22] p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">Your result</p>
                    <div className="mt-2 flex items-end gap-2">
                      <p className="text-4xl font-black tracking-[-0.06em] text-white">
                        {Math.round(result.wpm || 0)}
                      </p>
                      <span className="pb-1 text-xs font-semibold text-orange-400">
                        WPM
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:min-w-[250px]">
                    <div className="rounded-xl bg-black/20 p-3">
                      <p className="text-[9px] uppercase text-zinc-600">
                        Accuracy
                      </p>
                      <p className="mt-1 text-lg font-bold text-emerald-400">
                        {Math.round(result.accuracy || 0)}%
                      </p>
                    </div>
                    <div className="rounded-xl bg-black/20 p-3">
                      <p className="text-[9px] uppercase text-zinc-600">
                        Duration
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">
                        {duration(details.duration)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <MiniStat
                  label="Correct"
                  value={result.correctChars ?? result.correctCharacters ?? 0}
                  icon={CheckCircle2}
                  tone="green"
                />
                <MiniStat
                  label="Incorrect"
                  value={result.wrongChars ?? result.incorrectCharacters ?? 0}
                  icon={XCircle}
                  tone="red"
                />
                <MiniStat
                  label="Backspaces"
                  value={result.backspaceCount ?? 0}
                  icon={Delete}
                />
                <MiniStat
                  label={isRoom ? "Rank" : "Completion"}
                  value={
                    isRoom
                      ? `#${result.rank || "-"}`
                      : `${Math.round(result.completionPercentage || 0)}%`
                  }
                  icon={isRoom ? Trophy : Target}
                  tone={isRoom ? "amber" : "orange"}
                />
              </div>

              {isRoom && (
                <section className="mt-5 rounded-2xl border border-white/[0.06] bg-[#181C22] p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-400">
                        Final ranking
                      </p>
                      <h3 className="mt-1 text-lg font-bold">Leaderboard</h3>
                    </div>
                    {details.winner?.username && (
                      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-500/10 px-3 py-2 text-[10px] font-semibold text-amber-400">
                        <Crown size={13} />
                        Winner: {details.winner.username}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    {details.leaderboard?.map((player) => (
                      <div
                        key={`${player.userId}-${player.rank}`}
                        className={`flex items-center gap-3 rounded-xl border p-3 ${player.isCurrentUser ? "border-orange-500/20 bg-orange-500/[0.07]" : "border-white/[0.04] bg-[#20252D]"}`}
                      >
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04] text-xs font-black">
                          {player.rank <= 3 ? <Medal size={16} /> : player.rank}
                        </div>
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-orange-500/10">
                          {player.profilePhoto ? (
                            <img
                              src={player.profilePhoto}
                              alt={player.username}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-xs font-bold text-orange-400">
                              {player.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {player.username}
                            {player.isCurrentUser ? " (You)" : ""}
                          </p>
                          <p className="text-[9px] text-zinc-600">
                            {Math.round(player.accuracy || 0)}% accuracy
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black">
                            {Math.round(player.wpm || 0)}
                          </p>
                          <p className="text-[8px] uppercase text-zinc-600">
                            WPM
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(details.text || details.typedText) && (
                <section className="mt-5 rounded-2xl border border-white/[0.06] bg-[#181C22] p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Keyboard size={15} className="text-orange-400" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Session text
                    </p>
                  </div>
                  {details.text && (
                    <p className="mt-3 max-h-32 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                      {details.text}
                    </p>
                  )}
                  {details.typedText && (
                    <p className="mt-4 max-h-32 overflow-y-auto whitespace-pre-wrap border-t border-white/[0.05] pt-4 text-sm leading-6 text-zinc-400">
                      {details.typedText}
                    </p>
                  )}
                </section>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-zinc-500">
              Session details are unavailable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionDetailsModal;
