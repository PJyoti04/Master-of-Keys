import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Activity, Gauge, Target } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
);

function PerformanceChart({ data = [], loading = false }) {
  const [metric, setMetric] = useState("combined");

  const chartData = useMemo(() => {
    const datasets = [];
    if (metric === "combined" || metric === "wpm") {
      datasets.push({
        label: "WPM",
        data: data.map((item) => Number(item.wpm) || 0),
        borderColor: "rgb(249,115,22)",
        backgroundColor: "rgba(249,115,22,.13)",
        pointBackgroundColor: "rgb(249,115,22)",
        pointBorderColor: "rgb(32,37,45)",
        pointBorderWidth: 2,
        pointRadius: 2.5,
        pointHoverRadius: 5,
        borderWidth: 2,
        fill: true,
        tension: 0.38,
        yAxisID: "wpm",
      });
    }
    if (metric === "combined" || metric === "accuracy") {
      datasets.push({
        label: "Accuracy",
        data: data.map((item) => Number(item.accuracy) || 0),
        borderColor: "rgb(52,211,153)",
        backgroundColor: "rgba(52,211,153,.05)",
        pointBackgroundColor: "rgb(52,211,153)",
        pointBorderColor: "rgb(32,37,45)",
        pointBorderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
        fill: false,
        tension: 0.38,
        yAxisID: "accuracy",
      });
    }
    return { labels: data.map((item) => item.label || item.date), datasets };
  }, [data, metric]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(24,28,34,.96)",
        titleColor: "white",
        bodyColor: "rgb(212,212,216)",
        borderColor: "rgba(255,255,255,.08)",
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "rgb(113,113,122)",
          maxTicksLimit: 7,
          font: { size: 9 },
        },
      },
      wpm: {
        display: metric !== "accuracy",
        position: "left",
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,.045)" },
        border: { display: false },
        ticks: { color: "rgb(113,113,122)", font: { size: 9 } },
      },
      accuracy: {
        display: metric !== "wpm",
        position: "right",
        min: 0,
        max: 100,
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "rgb(113,113,122)",
          callback: (value) => `${value}%`,
          font: { size: 9 },
        },
      },
    },
  };

  const button = (name, label, Icon) => (
    <button
      type="button"
      onClick={() => setMetric(name)}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-semibold transition ${metric === name ? "bg-orange-500 text-white shadow-lg shadow-orange-500/15" : "text-zinc-500 hover:text-white"}`}
    >
      <Icon size={13} />
      {label}
    </button>
  );

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#20252D] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.14)] sm:p-5">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-500/[0.06] blur-3xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-400">
            Performance
          </p>
          <h2 className="mt-1 text-lg font-bold tracking-[-0.02em]">
            Progress over time
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Compare recent speed and accuracy results.
          </p>
        </div>
        <div className="grid grid-cols-3 rounded-xl bg-[#181C22] p-1">
          {button("combined", "Both", Activity)}
          {button("wpm", "WPM", Gauge)}
          {button("accuracy", "Accuracy", Target)}
        </div>
      </div>
      <div className="relative mt-4 h-[235px] sm:h-[310px]">
        {loading ? (
          <div className="h-full animate-pulse rounded-xl bg-white/[0.03]" />
        ) : data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-[#181C22]/70 text-center">
            <Gauge className="text-zinc-700" size={30} />
            <p className="mt-3 text-sm font-medium text-zinc-400">
              No performance data yet
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Complete a session to unlock your chart.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default PerformanceChart;
