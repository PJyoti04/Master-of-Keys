import { RotateCw } from "lucide-react";
import { TbLayoutDashboard, TbHome  } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
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
  graphData,
  onRetry,
  loading,
  setLoading,
}) {

  const nav = useNavigate();
  return (
    <>
      <div className="fixed top-[70px] left-0 right-0 bottom-0 z-[40] bg-[#181C22] overflow-auto">
        <div className="flex w-full px-10 py-8">
          {/* <h1 className="text-4xl font-bold text-center text-white mb-8">
              Test Complete 🎉
            </h1> */}

          <div className="bg-[#181C22] rounded-2xl px-6 flex-1 flex flex-col gap-10">
            {/* <h2 className="text-white text-xl font-semibold mb-5">
                WPM Progress
              </h2> */}

            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="1 3" />

                  <XAxis
                    label={{
                      value: "seconds",
                      position: "insideBottom",
                      offset: -4,
                    }}
                    dataKey="second"
                  />

                  <YAxis
                    label={{ value: "wpm", position: "insideLeft", angle: -90 }}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;

                      const data = payload[0].payload;

                      return (
                        <div className="bg-[#111] border border-gray-700 rounded-lg p-3 text-white">
                          <p>Second: {data.second}</p>

                          <p>WPM: {data.wpm}</p>

                          <p className="text-green-400">
                            Correct: {data.correct}
                          </p>

                          <p className="text-red-400">Wrong: {data.wrong}</p>

                          <p className="text-yellow-400">
                            Backspace: {data.backspace}
                          </p>
                        </div>
                      );
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="wpm"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-10 mt-10">

              <button
                onClick={() => nav('/')}
                className="
              px-5
              py-2
              underline underline-offset-2
              hover:text-orange-500
              rounded-xl
              font-semibold
              text-white
              transition
              flex
              items-center
              gap-3
            "
              >
                <TbHome  size={18} />
                Go to Home
              </button>

              <button
                onClick={onRetry}
                className="
              px-5
              py-2
              underline underline-offset-2
              hover:text-orange-500
              rounded-xl
              font-semibold
              text-white
              transition
              flex
              items-center
              gap-3
            "
              >
                <RotateCw size={18} />
                Try again
              </button>

              <button
                onClick={() => nav('/dashboard')}
                className="
              px-5
              py-2
              underline underline-offset-2
              hover:text-orange-500
              rounded-xl
              font-semibold
              text-white
              transition
              flex
              items-center
              gap-3
            "
              >
                <TbLayoutDashboard size={18} />
                Go To Dashboard
              </button>

            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-10 max-h-[80vh] scrollbar-hidden overflow-y-auto">
            <StatCard title="WPM" value={stats?.wpm ?? "96"} />

            <StatCard title="Accuracy" value={`${stats?.accuracy ?? 44}%`} />

            <StatCard title="Correct" value={stats?.correctCharacters} />

            <StatCard title="Wrong" value={stats?.incorrectCharacters} />

            <StatCard title="Backspace" value={stats?.backspaceCount} />

            <StatCard title="Score" value={stats?.score} />

            <StatCard title="Penalty" value={stats?.penalty} />

            <StatCard
              title="Completion"
              value={`${stats?.completionPercentage}%`}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-black/20 rounded-xl p-3 min-w-36 border border-orange-500/20">
      <div className="text-orange-500 text-lg ">{title}</div>

      <div className="text-white text-4xl font-bold mt-2">{value}</div>
    </div>
  );
}
