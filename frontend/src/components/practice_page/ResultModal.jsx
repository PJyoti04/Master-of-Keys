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
}) {
  return (
    <div className="fixed top-[70px] left-0 right-0 bottom-0 z-[9999] bg-[#0E1116] overflow-auto">
      <div className="max-w-7xl mx-auto px-8 py-8">

        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Test Complete 🎉
        </h1>

        <div className="grid grid-cols-4 gap-4 mb-10">

          <StatCard
            title="WPM"
            value={stats.wpm}
          />

          <StatCard
            title="Accuracy"
            value={`${stats.accuracy}%`}
          />

          <StatCard
            title="Correct"
            value={stats.correctCharacters}
          />

          <StatCard
            title="Wrong"
            value={stats.incorrectCharacters}
          />

          <StatCard
            title="Backspace"
            value={stats.backspaceCount}
          />

          <StatCard
            title="Score"
            value={stats.score}
          />

          <StatCard
            title="Penalty"
            value={stats.penalty}
          />

          <StatCard
            title="Completion"
            value={`${stats.completionPercentage}%`}
          />
        </div>

        <div className="bg-[#181C22] rounded-2xl p-6 mb-8">

          <h2 className="text-white text-xl font-semibold mb-5">
            WPM Progress
          </h2>

          <div className="h-[450px]">

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="second" />

                <YAxis />

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

                        <p className="text-red-400">
                          Wrong: {data.wrong}
                        </p>

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
        </div>

        <div className="flex justify-center">

          <button
            onClick={onRetry}
            className="
              px-10
              py-4
              bg-orange-500
              hover:bg-orange-600
              rounded-xl
              font-semibold
              text-white
              transition
            "
          >
            Try Again
          </button>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-[#181C22] rounded-xl p-5">
      <div className="text-gray-400 text-sm">
        {title}
      </div>

      <div className="text-white text-3xl font-bold mt-2">
        {value}
      </div>
    </div>
  );
}