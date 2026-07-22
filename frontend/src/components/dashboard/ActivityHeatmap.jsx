import { useMemo } from "react";
import { CalendarDays, Flame } from "lucide-react";

const LEVEL_STYLES = [
  "bg-white/[0.045] border-white/[0.04]",
  "bg-orange-950 border-orange-900/30",
  "bg-orange-800 border-orange-700/30",
  "bg-orange-600 border-orange-500/30",
  "bg-orange-400 border-orange-300/30",
];

const getDateKey = (date) => date.toISOString().slice(0, 10);

function ActivityHeatmap({ activity = [], year, loading = false }) {
  const activityMap = useMemo(
    () => new Map(activity.map((item) => [item.date, Number(item.count) || 0])),
    [activity],
  );
  const totalSessions = useMemo(
    () =>
      activity.reduce((total, item) => total + (Number(item.count) || 0), 0),
    [activity],
  );
  const activeDays = useMemo(
    () => activity.filter((item) => Number(item.count) > 0).length,
    [activity],
  );

  const weeks = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const firstSunday = new Date(startDate);
    firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

    const result = [];
    const cursor = new Date(firstSunday);

    while (cursor <= endDate || cursor.getDay() !== 0) {
      const week = [];
      for (let index = 0; index < 7; index += 1) {
        const date = new Date(cursor);
        const dateKey = getDateKey(date);
        const isCurrentYear = date.getFullYear() === year;
        week.push({
          date: dateKey,
          count: isCurrentYear ? activityMap.get(dateKey) || 0 : 0,
          isCurrentYear,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      result.push(week);
      if (cursor > new Date(year + 1, 0, 7)) break;
    }
    return result;
  }, [activityMap, year]);

  const getLevel = (count) => {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  };

  if (loading)
    return (
      <div className="mt-5 h-[170px] animate-pulse rounded-xl bg-white/[0.03]" />
    );

  return (
    <div className="mt-4">
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/[0.05] bg-[#181C22] p-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <Flame size={14} className="text-orange-400" />
            <span className="text-[9px] uppercase tracking-[0.12em]">
              Sessions
            </span>
          </div>
          <p className="mt-1 text-lg font-black text-white">{totalSessions}</p>
        </div>
        <div className="rounded-xl border border-white/[0.05] bg-[#181C22] p-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <CalendarDays size={14} className="text-emerald-400" />
            <span className="text-[9px] uppercase tracking-[0.12em]">
              Active days
            </span>
          </div>
          <p className="mt-1 text-lg font-black text-white">{activeDays}</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-hidden">
        <div className="flex min-w-max gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={
                    day.isCurrentYear
                      ? `${day.date}: ${day.count} session${day.count === 1 ? "" : "s"}`
                      : ""
                  }
                  className={`h-3.5 w-3.5 rounded-[4px] border transition hover:scale-125 hover:ring-2 hover:ring-orange-400/20 ${day.isCurrentYear ? LEVEL_STYLES[getLevel(day.count)] : "border-transparent bg-transparent"}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[9px] text-zinc-600">
        <span>{year} activity</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {LEVEL_STYLES.map((style, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-[3px] border ${style}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
