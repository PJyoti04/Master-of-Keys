import { RotateCw, Save, TrendingUp } from "lucide-react";
import '../../App.css';
import {
  TbLayoutDashboard,
  TbHome,
  TbLogin,
  TbUserPlus,
  TbCheck,
  TbX,
  TbArrowBackUp,
  TbTargetArrow,
} from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ResultModal({
  stats,
  graphData = [],
  onRetry,
}) {
  const navigate = useNavigate();

  const isGuestResult =
    stats?.isGuestResult === true ||
    stats?.isSaved === false;

  const safeGraphData = Array.isArray(graphData)
    ? graphData
    : [];

  const safeStats = {
    wpm: Number(stats?.wpm) || 0,
    accuracy: Number(stats?.accuracy) || 0,
    correctCharacters:
      Number(
        stats?.correctCharacters ??
          stats?.correctChars
      ) || 0,
    incorrectCharacters:
      Number(
        stats?.incorrectCharacters ??
          stats?.wrongChars
      ) || 0,
    backspaceCount:
      Number(stats?.backspaceCount) || 0,
    score: Number(stats?.score) || 0,
    penalty: Number(stats?.penalty) || 0,
    completionPercentage:
      Number(stats?.completionPercentage) || 0,
  };

  const statCards = [
    {
      title: "WPM",
      value: safeStats.wpm,
      subtitle: "Typing speed",
      icon: <TrendingUp size={20} />,
      valueClass: "text-orange-400",
    },
    {
      title: "Accuracy",
      value: `${safeStats.accuracy}%`,
      subtitle: "Keystroke accuracy",
      icon: <TbTargetArrow size={21} />,
      valueClass: "text-emerald-400",
    },
    {
      title: "Correct",
      value: safeStats.correctCharacters,
      subtitle: "Correct keystrokes",
      icon: <TbCheck size={22} />,
      valueClass: "text-emerald-400",
    },
    {
      title: "Wrong",
      value: safeStats.incorrectCharacters,
      subtitle: "Incorrect keystrokes",
      icon: <TbX size={22} />,
      valueClass: "text-red-400",
    },
    {
      title: "Backspaces",
      value: safeStats.backspaceCount,
      subtitle: "Corrections made",
      icon: <TbArrowBackUp size={21} />,
      valueClass: "text-yellow-400",
    },
    {
      title: "Score",
      value: safeStats.score,
      subtitle: "Final test score",
      icon: <Save size={19} />,
      valueClass: "text-white",
    },
    {
      title: "Penalty",
      value: safeStats.penalty,
      subtitle: "Mistake penalty",
      icon: <TbX size={20} />,
      valueClass: "text-red-400",
    },
    {
      title: "Completion",
      value: `${safeStats.completionPercentage}%`,
      subtitle: "Text completed",
      icon: <TbTargetArrow size={21} />,
      valueClass: "text-orange-400",
    },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 top-[70px] z-[40] overflow-y-auto bg-[#181C22] text-white scrollbar-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none fixed -left-32 top-24 h-80 w-80 rounded-full bg-orange-500/[0.07] blur-[120px]" />

      <div className="pointer-events-none fixed -right-32 bottom-10 h-96 w-96 rounded-full bg-orange-600/[0.05] blur-[130px]" />

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          opacity-20
          [background-image:linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)]
          [background-size:48px_48px]
        "
      />

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-400">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
              Test completed
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
              Your typing results
            </h1>

            <p className="mt-2 max-w-xl font-sans text-sm leading-6 text-zinc-500">
              Review your performance, identify your mistakes and try again to
              improve your speed and accuracy.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.05] px-4 font-sans text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.09] hover:text-white"
            >
              <TbHome size={18} />
              Home
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.05] px-4 font-sans text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.09] hover:text-white"
            >
              <TbLayoutDashboard size={18} />
              Dashboard
            </button>

            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 font-sans text-sm font-bold text-[#181C22] shadow-[0_14px_35px_rgba(249,115,22,0.18)] transition hover:-translate-y-0.5 hover:bg-orange-400"
            >
              <RotateCw size={18} />
              Try again
            </button>
          </div>
        </header>

        {/* Guest information */}
        {isGuestResult && (
          <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/[0.14] via-orange-500/[0.06] to-black/10 p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-orange-500/15 blur-[75px]" />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-500/15 text-orange-400">
                  <Save size={23} />
                </span>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    This session was not saved
                  </h2>

                  <p className="mt-1 max-w-2xl font-sans text-sm leading-6 text-zinc-400">
                    You completed this test as a guest. Log in or create an
                    account to save your results, track progress and view your
                    typing history.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                <Link
                  to="/login"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 font-sans text-sm font-bold text-[#181C22] transition hover:bg-orange-400"
                >
                  <TbLogin size={19} />
                  Log in
                </Link>

                <Link
                  to="/signup"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.07] px-5 font-sans text-sm font-semibold text-white transition hover:bg-white/[0.11]"
                >
                  <TbUserPlus size={19} />
                  Create account
                </Link>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
          {/* Graph */}
          <section className="min-w-0 rounded-3xl bg-black/15 p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  WPM progression
                </h2>

                <p className="mt-1 font-sans text-xs text-zinc-600">
                  Your typing speed throughout the session.
                </p>
              </div>

              <div className="flex items-center gap-2 font-sans text-xs text-zinc-500">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Words per minute
              </div>
            </div>

            <div className="h-[270px] w-full sm:h-[330px] lg:h-[400px]">
              {safeGraphData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={safeGraphData}
                    margin={{
                      top: 10,
                      right: 12,
                      left: -18,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid
                      stroke="rgba(255,255,255,0.05)"
                      strokeDasharray="3 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="second"
                      stroke="#52525b"
                      tick={{
                        fill: "#71717a",
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                      label={{
                        value: "Seconds",
                        position: "insideBottom",
                        offset: -8,
                        fill: "#52525b",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      stroke="#52525b"
                      tick={{
                        fill: "#71717a",
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                      width={45}
                      label={{
                        value: "WPM",
                        position: "insideLeft",
                        angle: -90,
                        fill: "#52525b",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Line
                      type="monotone"
                      dataKey="wpm"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: "#f97316",
                        stroke: "#181C22",
                        strokeWidth: 3,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-black/10 px-5 text-center">
                  <TrendingUp
                    size={32}
                    className="text-orange-500/60"
                  />

                  <h3 className="mt-4 font-semibold text-zinc-300">
                    No graph data available
                  </h3>

                  <p className="mt-1 max-w-sm font-sans text-xs leading-5 text-zinc-600">
                    Complete another typing test to generate your WPM progress
                    graph.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Statistics */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
            {statCards.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </section>
        </div>

        {/* Mobile action section */}
        <section className="mt-6 flex flex-col gap-3 rounded-3xl bg-black/15 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-white">
              Ready to improve your score?
            </h2>

            <p className="mt-1 font-sans text-xs leading-5 text-zinc-600">
              Retry the test and focus on maintaining accuracy while increasing
              your speed.
            </p>
          </div>

          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 font-sans text-sm font-bold text-[#181C22] transition hover:bg-orange-400 sm:w-auto"
          >
            <RotateCw size={18} />
            Practice again
          </button>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  valueClass = "text-white",
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-black/15 p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-black/20 sm:p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-orange-500/[0.05] blur-2xl transition group-hover:bg-orange-500/[0.09]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04] text-orange-400">
            {icon}
          </span>

          <span className="font-sans text-[9px] uppercase tracking-[0.12em] text-zinc-600">
            {title}
          </span>
        </div>

        <strong
          className={`mt-5 block text-2xl font-black tabular-nums sm:text-3xl ${valueClass}`}
        >
          {value ?? 0}
        </strong>

        <p className="mt-1 font-sans text-[10px] text-zinc-600">
          {subtitle}
        </p>
      </div>
    </article>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0]?.payload || {};

  return (
    <div className="min-w-[155px] rounded-xl bg-[#111419] p-3 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
      <p className="mb-2 font-sans text-[10px] uppercase tracking-wide text-zinc-500">
        Second {data.second ?? 0}
      </p>

      <div className="space-y-1.5 font-sans text-xs">
        <TooltipRow
          label="WPM"
          value={data.wpm ?? 0}
          valueClass="text-orange-400"
        />

        <TooltipRow
          label="Correct"
          value={data.correct ?? 0}
          valueClass="text-emerald-400"
        />

        <TooltipRow
          label="Wrong"
          value={data.wrong ?? 0}
          valueClass="text-red-400"
        />

        <TooltipRow
          label="Backspace"
          value={data.backspace ?? 0}
          valueClass="text-yellow-400"
        />
      </div>
    </div>
  );
}

function TooltipRow({
  label,
  value,
  valueClass = "text-white",
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-zinc-500">{label}</span>

      <strong className={valueClass}>{value}</strong>
    </div>
  );
}
